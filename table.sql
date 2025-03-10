-- The sql script for creating the table
CREATE TABLE investors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sector VARCHAR(255),
    funding_stage VARCHAR(255), --series 
    country VARCHAR(255),
    investment_min NUMERIC,
    investment_max NUMERIC,
    city VARCHAR(255),
    prop_tech VARCHAR(10),  -- Yes/No values
    tech_medium TEXT,
    video_link TEXT
);

--To confirm that the data are imported correctly
SELECT * FROM investors;