/**
 * Module containing exceptions catch to transform in to user error.
 */
"use strict";

/**
 * Import necessary to set rules to name fields.
 */
const
  Joi = require('joi');

const schema_throw_user_error = [
  Joi.object()
    .keys({
      system_error : Joi.string().required(),
      user_error   : Joi.string().required(),
    }),
  Joi.string()
];

/**
 * Throw user error function.
 * @param {*} args Contain system and user errors.
 * @throws {Error} Failed to throw user errors - Case Joi validate are invalide (don't match args to schema).
 * @throws exception if system and user errors are valid.
 */
function throw_user_error(args) {
  const validate_args = Joi.validate(args, schema_throw_user_error);

  // Ensure all necesasry info was privided
  if ( validate_args.error) {
    // Tricky case here as we failed to rais exception, so log all data we have
    // and still rais generic exception
    console.log(
      'throw_user_error got invalid parameters: '
      + validate_args.annotate()
    );
    console.dir(args);
    throw new Error('Failed to throw user errors');
  }

  let system_error_message,
      user_error_message;

  // Special case when user is lazy and specified generic error message to be
  // used for system and customer level
  if ( typeof args === 'string' ) {
    system_error_message = user_error_message = args;
  } else {
    system_error_message = args.system_error;
    user_error_message   = args.user_error;
  }

  let exception = new Error( system_error_message );

  if ( user_error_message ) {
    exception.user_error_message = user_error_message;
  }

  exception.tom_error = true;

  throw exception;
}

/**
 * Get system error message function.
 * @param {*} error Any system error.
 * @return return null case system error is not defined.
 * @return return the system error.
 */
function extract_system_error_message(error) {
  if ( ! error ) {
    return null;
  }

  return error;
}

/**
 * Get user error message function.
 * @param {*} error Any user error.
 * @return {Null} case system error is not defined
 * @return {String} the system error case his type is a String
 * @return {String} his property message if have it.
 * @return {String} default message 'N/A'.
 */
function extract_user_error_message(error) {
  if ( ! error ) {
    return null;
  }

  if (typeof error === 'string') {
    return error;
  }

  if ( error.hasOwnProperty( 'user_error_message' )) {
    return error.user_error_message;
  }

  return 'N/A';
}

module.exports = {
  throw_user_error             : throw_user_error,
  extract_user_error_message   : extract_user_error_message,
  extract_system_error_message : extract_system_error_message,

  throwUserError            : throw_user_error,
  extractUserErrorMessage   : extract_user_error_message,
  extractSystemErrorMessage : extract_system_error_message,
};
