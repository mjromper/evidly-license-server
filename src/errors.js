// errors

module.exports = {
    SUCCESS: { status: 0, statusMsg: 'SUCCESS'},
    BAD_REQUEST: { status: 1, errorMsg: 'BAD_REQUEST'},
    NULL_DATA: { status: 2, errorMsg: 'NULL_DATA'},
    NO_PERMISSION: { status: 3, errorMsg: 'NO_PERMISSION'},
    INVALID_INPUT: { status: 4, errorMsg: 'INVALID_INPUT'},
    SERVER_ERROR: { status: 5, errorMsg: 'SERVER_ERROR'},
    DUPLICATE_DATA: { status: 6, errorMsg: 'DUPLICATE_DATA'},
    INVALID_CAPTCHA: { status: 7, errorMsg: 'INVALID_CAPTCHA'},
    INVALID_CREDENTIAL: { status: 8, errorMsg: 'INVALID_CREDENTIAL'},
    INVALID_CODE: { status: 9, errorMsg: 'INVALID_CODE'},
    LOGIN_REQUIRED: { status: 10, errorMsg: 'LOGIN_REQUIRED'},
    PENDING: { status: 11, errorMsg: 'PENDING'},
    ACCOUNT_DISABLED: { status: 12, errorMsg: 'ACCOUNT_DISABLED'},
    FAILURE: { status: 13, errorMsg: 'FAILURE'}
  };
  