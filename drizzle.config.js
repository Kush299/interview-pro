/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: "postgresql",
    dbCredentials: {
      url: 'postgresql://account:npg_QgMrKCVObt98@ep-old-smoke-a8lnxya4-pooler.eastus2.azure.neon.tech/ai-mock-interview?sslmode=require'
    },
  };