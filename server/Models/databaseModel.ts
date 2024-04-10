// !!! FIX FILE
import { Pool, PoolConfig, QueryConfig } from 'pg';

const poolConfig: PoolConfig = {
  host: "localhost",
  user: "postgres",
  port: 5432,
  password: "password",
  database: "postgres"
}

const pool = new Pool(poolConfig);

export default {
  query: <T>(q: string | QueryConfig, values?: T[]) => {
    return pool.query(q, values);
  },
};
