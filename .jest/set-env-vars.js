process.env.NODE_ENV = "test";

// start --------------------------------- batch-svc ---------------------------------
process.env.SSH_USER_CPC = "cpc_user";
process.env.CRON_SCHEDULE_CPC = "*/15 * * * *";

// BATCH IN & OUT FOLDER
process.env.IN_FOLDER_PATHS = `{"/cpc/out":"/cpc/in", "/iwps/out":"/iwps/in", "/rdi-ep/out":"/rdi-ep/in"}`;
process.env.OUT_FOLDER_PATHS = `{"/cpc/out":"cpc/in","/iwps/out":"/iwps/in","/rdi-ep/out":"/rdi-ep/out"}`;

// AWS
process.env.AWS_ACCESS_KEY_ID = "aws-s3-sccess-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "aws-s3-secret-access-key";
process.env.AWS_S3_BUCKET_NAME = "sample-bucket";
// end --------------------------------- batch-svc ---------------------------------

// start --------------------------------- auth-svc ---------------------------------
// intranet incoming API route
process.env.API_KEY_PROXY_FORWARD_BASE_ROUTE = "/intranet/ext/api/v1";
// API credentials & dynamic routing
process.env.SOURCE_SYSTEM_CONFIG = `{"/digital-photo":{"x-sgwp-apikey":"test-api-key","x-sgwp-apisecret":"test-api-secret"},"/fetch-digitalqr":{"x-sgwp-apikey":"test-api-key","x-sgwp-apisecret":"test-api-secret"},"/updatePass":{"x-sgwp-apikey":"test-api-key","x-sgwp-apisecret":"test-api-secret"}}`;
process.env.INTERNAL_FORWARD_CONFIG =
  '{"/digital-photo":{"x-sgwp-apikey":"test-api-key","x-sgwp-apisecret":"test-api-secret"},"/fetch-digitalqr":{"x-sgwp-apikey":"test-api-key","x-sgwp-apisecret":"test-api-secret"},"/updatePass":{"x-sgwp-apikey":"test-api-key","x-sgwp-apisecret":"test-api-secret"}}';

// internet outgoing API route
process.env.FORWARD_PROXY_BASE_ROUTE = "http://internet-url/api/v1";

// jwt
process.env.ISSUER = "sgwp";
process.env.AUDIENCE = "source-system-name";

// Internal API encryption key
process.env.KM00 = "sample-key";

// end --------------------------------- auth-svc ---------------------------------
