const express = require('express');
const app = express();
const os = require('os');
const router = express.Router();
const createError = require('http-errors');
const { check } = require('express-validator');

// const jwtTokenAuth = require('../middleware/jwt-protect-routes/jwt')
const ctrlUtils = require('../blockchain/utils/common');

const { ROLE } = require('../controllers/utils/env');

// const common = require('../controllers/utils/commonfunc');

router.use('/health', (req, res)=>{
  res.status(200).end();
})

router.get('/ping', function(rew, res){
  try {
    return res.status(200).json({
      status: true,
      data: 'pong',
      process: `${process.env}`,
      errorMessage: null
    })
  }catch(error){
    console.error('Failed during health check ' + error.message)
    return res.status(500).json({
      status: false,
      data: null,
      errorMessage: common.constructErrorMessage(`${createError.InternalServerError().message}`)
    })
  }
})

router.use('/hostname', (req,res)=>{
  res.status(200).json({
    status:true,
    hostname: os.hostname()
  })
})

// ============== //
//      Users     //
// ============== //


const ctrlUsersQuery = require('../blockchain/users/query')
const ctrlUserAdd = require('../blockchain/users/add');



// Get one user
router.get('/users/:REPRESENTATIVE_EMAIL', ctrlUsersQuery.getOneUser);

// Get all user
router.get('/users', ctrlUsersQuery.getAllUser);



// Create new user
router.post('/users', [
  check('representativeName')
    .not().isEmpty()
    .withMessage('Name is required.'),
  check('representativeEmail')
    .trim().escape()
    .not().isEmpty()
    .withMessage('EmailId is required.')
    .isEmail()
    .withMessage('Invalid email id.'),
  check('representativePassword')
    .trim().escape()
    .not().isEmpty()
    .withMessage('Password is required.'),
  check('representativeOrganisation')
    .not().isEmpty()
    .withMessage('Organisation is required.'),
  check('representativeRole')
    .not().isEmpty()
    .withMessage('Role is required.')
    .isIn([
      ROLE.customer_administrators.key, 
      ROLE.customer_department_head.key, 
      ROLE.customer_team_lead.key, 
      ROLE.project_manager.key, 
      ROLE.customer_users.key
    ])
    .withMessage(`Wrong role input. ( Choose from the following: '${ROLE.customer_administrators.key}', '${ROLE.customer_department_head.key}', '${ROLE.customer_team_lead.key}', '${ROLE.project_manager.key}', '${ROLE.customer_users.key}' )`)
], ctrlUtils.checkValidations
, ctrlUserAdd.addUsers);


// Update a user profile details
const ctrlUserUpdate = require('../blockchain/users/update');
router.put('/users/:REPRESENTATIVE_EMAIL', ctrlUserUpdate.updateUser);


// Delete a user
const ctrlUserDelete = require('../blockchain/users/delete');
router.delete('/users/:REPRESENTATIVE_EMAIL', ctrlUserDelete.deleteOneUsers)




// ================== //
//      Documents     //
// ================== //

const ctrlDocumentsQuery = require('../blockchain/documents/query');

// get all docuemnts list by
router.get('/documents/all/:REPRESENTATIVE_EMAIL', ctrlDocumentsQuery.listAllDocuments);

// get one document details
router.get('/documents/:DOCUMENT_ID', ctrlDocumentsQuery.getDocumentsByDocId)


// Add a new document
const ctrlDocumentsAdd = require('../blockchain/documents/add')
router.post('/documents', [
  check('representativeEmail')
    .not().isEmpty()
    .withMessage('representativeEmail is required.'),
  check('dataHash')
    .not().isEmpty()
    .withMessage('Data hash is required.'),
  check('title')
    .not().isEmpty()
    .withMessage('Title is required.'),
  check('metadata')
    .not().isEmpty()
    .withMessage('Metadata is required.'),
  check('documentPath')
    .not().isEmpty()
    .withMessage('documentPath is required.'),
], ctrlUtils.checkValidations, ctrlDocumentsAdd.addDocuments)



// Update the document
const ctrlDocumentsUpdate = require('../blockchain/documents/update');
router.put('/documents/:DOCUMENT_ID', ctrlDocumentsUpdate.updateDocuments)


// Delete a document
const ctrlDocumentsDelete =  require('../blockchain/documents/delete');
router.delete('/documents/:DOCUMENT_ID', ctrlDocumentsDelete.deleteDocuments)

// ================== //
//       NETWORK      //
// ================== //


const ctrlNetwork = require('../blockchain/network/info')
router.get('/:ORG/chain-info', ctrlNetwork.getChainInfo)
// router.get('/:ORG/tnx/:TNXID', ctrlNetwork.getTransactionByTxID)
// router.get('/block/:BLOCK_NUM', jwtTokenAuth, ctrlUtils.checkCustomerAdministrators, ctrlNetwork.getBlockByNumber)


module.exports = router;