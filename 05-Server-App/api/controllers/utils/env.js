const path = require('path');


const ROLE = {
    horus_super_admins: {
        name: 'HORUS Super Admins',
        key: 'horus_super_admins'
    },
    horus_regional_admins: {
        name: 'HORUS Regional Admins',
        key: 'horus_regional_admins'
    },
    customer_administrators: {
        name: 'Customer Administrators',
        key:'customer_administrators'
    },
    customer_department_head: {
        name: 'Customer Department Head',
        key: 'customer_department_head'
    },
    customer_team_lead: {
        name: 'Customer Team Lead',
        key: 'customer_team_lead'
    },
    project_manager : {
        name: 'Project Manager',
        key: 'project_manager'
    },
    customer_users: {
        name: 'Customer Users',
        key: 'customer_users'
    }
}

const DOC_STATUS = {
    CREATE: 'create',
    EDIT: 'edit',
    UPDATE: 'update',
    SHARE: 'share',
    DELETE: 'delete',
}

// TODO
let dummy = ''

module.exports = {
    ROLE,
}