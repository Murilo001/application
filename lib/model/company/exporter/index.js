/** 
 * Module containing company exporter.
 */
'use strict';

/**
 * Import necessary to set rules to name fields.
 */
const
  Joi            = require('joi'),
  Promise        = require('bluebird'),
  CompanySummary = require('./summary');

const
  constructor_schema = Joi.object().required()
    .keys({
      dbSchema : Joi.object().required(),
    }),
  schemaPromiseCompanySummary = Joi.object().required()
    .keys({
      company : Joi.object().required(),
    });

/**
 * CompanyExporter use summary to map all company and users and export it. 
 */
class CompanyExporter {
  /**
   * Instantiate a db_model case args are valid.
   * @param {Company} args contain dbSchema. 
   */
  constructor(args) {
    args = Joi.attempt(
      args,
      constructor_schema,
      "Faled to instantiate new companyExporter due to arguments validation"
    );

    this._db_model = args.dbSchema;
  }

  get dbModel() {
    return this._db_model;
  }

  /**
   * Validate company summary with Joi.
   * 
   * @param {SchemaCompanySummary} args used to map company and users after validate. 
   */  
  promiseCompanySummary(args) {
    args = Joi.attempt(
      args,
      schemaPromiseCompanySummary,
      "Failed to get company summary die to validation errors"
    );

    let
      self    = this,
      company = args.company;

    return Promise
      .join(
        self.dbModel.Company
          .scope('with_simple_departments', 'with_leave_types')
          .findOne({
            where : { id : company.id },
          }),
        self.dbModel.User
          .scope('with_simple_leaves')
          .findAll({
            where : { companyId : company.id }
          }),
          (company, users) => Promise.resolve( new CompanySummary({
            company : company,
            users   : users,
          }))
      );
  }

}

module.exports = CompanyExporter;
