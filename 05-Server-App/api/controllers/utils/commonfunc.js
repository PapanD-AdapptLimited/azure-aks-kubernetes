const express = require('express');

module.exports = {
    constructErrorMessage: function(msg){
        let result = new Array()
        result.push({
            "value": null,
            "msg": msg,
            "param": null,
            "location": null
        })
        return result
    },

    catchBlockchianErrorMessage: function(error){
        console.error(error)
        let errorMessageString = error.message
        if(errorMessageString.toLowerCase().indexOf('user does not exist') !== -1){
            return "User does not exist.";
        }else if(errorMessageString.indexOf('This user already exists') !== -1){
            return "This user already exists."
        }
        return errorMessageString
    }
}