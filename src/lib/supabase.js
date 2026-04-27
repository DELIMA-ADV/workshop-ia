// Cliente Supabase com Proxy via API Serverless
// As requisições passam pelo backend (/api/supabase) para evitar CORS e problemas de DNS

const API_BASE = '/api/supabase';

class SupabaseProxy {
  from(table) {
    return new QueryBuilder(table);
  }
}

class QueryBuilder {
  constructor(table) {
    this.table = table;
    this._selectColumns = '*';
    this._filters = {};
    this._order = null;
    this._action = null;
    this._data = null;
  }

  select(columns = '*') {
    this._selectColumns = columns;
    return this;
  }

  eq(column, value) {
    this._filters[column] = value;
    return this;
  }

  order(column, { ascending = true } = {}) {
    this._order = { column, ascending };
    return this;
  }

  limit(count) {
    return this;
  }

  insert(records) {
    const recordToInsert = Array.isArray(records) ? records[0] : records;
    this._action = 'insert';
    this._data = recordToInsert;
    // Retorna um objeto que permite chainar .select()
    return new SelectableResult(this);
  }

  update(data) {
    this._action = 'update';
    this._data = data;
    // Retorna uma Promise com {data, error}
    return this._execute();
  }

  delete() {
    this._action = 'delete';
    return this._execute();
  }

  async _execute() {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: this._action,
          table: this.table,
          data: this._data,
          filters: this._filters,
          select: this._selectColumns,
          order: this._order
        })
      });

      const result = await response.json();

      if (!response.ok) {
        console.error(`❌ Erro ${this._action} ${this.table}:`, result.error);
        return { data: null, error: { message: result.error, details: result.details } };
      }

      return { data: result.data, error: null };
    } catch (error) {
      console.error(`❌ Erro na chamada proxy:`, error);
      return { data: null, error: { message: error.message } };
    }
  }

  // Quando usado com await (select)
  async then(onFulfilled, onRejected) {
    this._action = 'select';
    try {
      const result = await this._execute();
      return onFulfilled ? onFulfilled(result) : result;
    } catch (error) {
      return onRejected ? onRejected(error) : { data: null, error };
    }
  }
}

class SelectableResult {
  constructor(queryBuilder) {
    this.queryBuilder = queryBuilder;
  }

  select(columns = '*') {
    this.queryBuilder.select(columns);
    // Retorna uma Promise com {data, error}
    return this.queryBuilder._execute();
  }
}

export const supabase = new SupabaseProxy();
