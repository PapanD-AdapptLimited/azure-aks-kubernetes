const express = require('express');
const createError = require('http-errors');
const { validationResult } = require('express-validator')

// Constant
// const { ROLE } = require('../../controllers/utils/env');

// const common = require('../../controllers/utils/commonfunc');



function consolelog(message, param = '') {
    if (process.env.DEBUG) console.log('[utils:common]', message, param)
}


module.exports = {

    checkValidations: function(req, res, next) {

        consolelog("Check Validations.");

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({
                status: false,
                data: null,
                errorMessage: errors.array()
            })
        }

        next();
    },

    

}