module.exports = {

    dayLimit: {
        name: '24HourLimit',
        message: 'Max donations per 8 hours reached.  Try again later.',
        status: 403
    },

    ipUsed: {
        name: 'IPAddrUsed',
        message: 'IP Address already requested funds.',
        status: 403
    },

    addressUsed: {
        name: 'mixAddrUsed',
        message: 'Mix Address already requested funds.',
        status: 403
    },

    faucetEmpty: {
        name: 'faucetEmpty',
        message: 'Faucet out of funds',
        status: 403
    },

    otherError: (_message, _status = 403) => {
        return {
            name: 'otherError',
            message: _message,
            status: _status
        }
    },

    failedCaptcha: {
        name: 'failedCaptcha',
        messgae: 'Captcha incorrect or expired',
        status:403
    }

}