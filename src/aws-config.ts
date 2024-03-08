import AWS from "aws-sdk"

AWS.config.update({
  accessKeyId: 'AKIA4EP2DR6GPZYF5RXN',
  secretAccessKey: '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',
  region: 'us-east-1'
});

 const s3 = new AWS.S3();

 export default s3;