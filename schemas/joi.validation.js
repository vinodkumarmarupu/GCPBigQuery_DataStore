const Joi = require('joi');

 metadata = Joi.object({
	"count": Joi.number().integer(),
	"limit": Joi.number().integer(),
	"offset": Joi.number().integer()
}) 

schema = Joi.object().keys({
	"userId": Joi.string(),
	"firstName": Joi.string(),
	"lastName": Joi.string(),
	"fullName": Joi.string(),
	"emailAddress": Joi.string(),
	"deptNumber": Joi.number().integer(),
	"userActive": Joi.string(),
	"siteNumber": Joi.number().integer(),
	"managerId": Joi.string(),
	"jobTitle": Joi.string(),
	"userDn": Joi.string(),
	"insertDate": Joi.date()
})
arrayJoi = Joi.array().items(schema)

 userJoi = Joi.object({
	
	"metadata": metadata,
	"users": arrayJoi
	
}) 

module.exports = userJoi;