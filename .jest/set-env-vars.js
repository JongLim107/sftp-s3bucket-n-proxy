process.env.NODE_ENV = "test";

process.env.SSH_USER_CPC = "cpc_user";
process.env.CRON_SCHEDULE_CPC = "*/15 * * * *";
process.env.IN_FOLDER_PATHS = `{"/cpc/out":"/cpc/in", "/iwps/out":"/iwps/in", "/rdi-ep/out":"/rdi-ep/in"}`;

// BATCH/OUT/FOLDER
process.env.OUT_FOLDER_PATHS = `{"/cpc/out":"cpc/in","/iwps/out":"/iwps/in","/rdi-ep/out":"/rdi-ep/out"}`;

// AWS
process.env.AWS_ACCESS_KEY_ID = "aws-s3-sccess-key-id";
process.env.AWS_SECRET_ACCESS_KEY = "aws-s3-secret-access-key";
process.env.AWS_S3_BUCKET_NAME = "sample-bucket";
