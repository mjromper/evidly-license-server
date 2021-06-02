const mongoose = require('mongoose');
const boom = require('@hapi/boom');
const config = require('../config');

const options = {
    loggerLevel: 'error',
    useNewUrlParser: true,
    //reconnectInterval: 2000,
    //reconnectTries: 30, // Retry up to 30 times
    useCreateIndex: true,
    useUnifiedTopology: true
};

console.log("--- MongoDB connecting... ", config.mongouri);

// Connect to DB
mongoose.connect(config.mongouri, options);

// When successfully connected
mongoose.connection.on('connected', () => {
  console.log('--- MongoDB connected');
});

// When successfully reconnected
mongoose.connection.on('reconnected', () => {
  console.log('--- MongoDB dbevent: reconnected');
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  console.log(`--- MongoDB dbevent: error: ${err}`);
  //console.log(`Retry mongo connect`);
  //mongoose.connect(process.env.MONGO_URI, options);
});
  

// Get Data Models
const License = require('./licenseModel');


const get = async (model, filter, select, skip, limit, populates, reply) => {
  var sort = {};
  var modelAttributes = Object.keys(model.schema.tree);

  if ( model === Scenario ) {
    if ( modelAttributes.indexOf("updated") !== -1) {
      sort.updated = -1;
    }
  }
  
  if ( modelAttributes.indexOf("created") !== -1) {
    sort.created = -1;
  }
  try {
    var exec = model.find(filter, select).sort(sort);
    var totalDocs = await model.countDocuments(filter);
    
    skip = skip? parseInt(skip) : 0;
    exec = exec.skip(skip);
    
    if ( limit ) {
      limit = parseInt(limit);
      exec = exec.limit(limit);
    }
    
    if ( populates ) {
      populates = JSON.parse(populates);
      populates.forEach(p=> {
        exec = exec.populate(p);
      });
    }
    
    const entity = await exec;
    var out = {
      total: totalDocs, 
      count: entity.length,
      results: entity
    }
    if ( limit && (skip + limit) < totalDocs) {
      out.nextSkip = skip+limit;
      out.nextLimit = limit;
    }
    return out;

  } catch (err) {
    throw boom.boomify(err)
  }
}

const getById = async (model, id, reply) => {
  try {
    var exec = model.findById(id);
    const entity = await exec;
    return entity;
  } catch (err) {
    throw boom.boomify(err);
  }
};

const getOne = async (model, filter, reply) => {
  try {
    var exec = model.findOne(filter);
    const entity = await exec;
    return entity;
  } catch (err) {
    throw boom.boomify(err);
  }
};

const add = async (model, data, reply) => {
  try {
    const entity = new model(data)
    return entity.save();
  } catch (err) {
    throw boom.boomify(err);
  }
};

const update = async (model, id, body, reply) => {
  try {
    const { ...updateData } = body;
    updateData.updated = new Date();
    //console.log("UPDATE", id, updateData);
    var exec =  model.findByIdAndUpdate(id, updateData, { new: true });
    const update = await exec;
    return update;
  } catch (err) {
    throw boom.boomify(err)
  }
};

const updateMany = async (model, filter, body, reply) => {
  try {
    const { ...updateData } = body;
    
    updateData.updated = new Date();
    var exec =  model.updateMany(filter, updateData);

    return await exec;

  } catch (err) {
    throw boom.boomify(err)
  }
};

const del = async (model, id, reply) => {
  try {
    const entity = await model.findByIdAndRemove(id)
    return entity;
  } catch (err) {
    throw boom.boomify(err)
  }
}

const count = async (model, filter, reply) => {
  try {
    var totalDocs = await model.countDocuments(filter);
    return totalDocs;
  } catch (err) {
    throw boom.boomify(err)
  }
}

function _m(model) {
  return {
    get: async (filter, select, skip, limit, populates, reply) => {
      return get(model, filter, select, skip, limit, populates, reply);
    },
    getById: async (id, reply) => {
      return getById(model, id, reply);
    },
    getOne: async (filter, reply)=>  {
      return getOne(model, filter, reply);
    },
    add: async (data, reply) => {
      return add(model, data, reply);
    },
    update: async (id, data, reply) => {
      return update(model, id, data, reply);
    },
    updateMany: async(filter, data, reply) => {
      return updateMany(model, filter, data, reply);
    },
    del: async (id, reply) => {
      return del(model, id, reply);
    },
    count: async (filter, reply) => {
      return count(model, filter, reply);
    }
  }
}


module.exports = {
  license: _m(License)
};




