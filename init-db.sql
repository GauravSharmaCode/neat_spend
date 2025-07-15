-- Create databases for different services
CREATE DATABASE neatspend_users;
CREATE DATABASE neatspend_sms;
CREATE DATABASE neatspend_insights;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE neatspend TO postgres;
GRANT ALL PRIVILEGES ON DATABASE neatspend_users TO postgres;
GRANT ALL PRIVILEGES ON DATABASE neatspend_sms TO postgres;
GRANT ALL PRIVILEGES ON DATABASE neatspend_insights TO postgres;
