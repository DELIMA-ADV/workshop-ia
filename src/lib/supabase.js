// Cliente Supabase com Proxy via API Serverless
// As requisições passam pelo backend (/api/supabase) para evitar CORS e problemas de DNS

class SupabaseProxy {
  from(table) {
    return new TableProxy(table);
  }
}

class TableProxy {
  constructor(table) {
    this.table = table;
    this.selectColumns = '*';
    this.filtersList = []; // Array de filtros: [{column, value, operator}]
  }

  select(columns = '*') {
    const newInstance = new TableProxy(this.table);
    newInstance.selectColumns = columns;
    newInstance.filtersList = [...this.filtersList];
    return newInstance;
  }

  eq(column, value) {
    this.filtersList.push({ column, value, operator: 'eq' });
    return this;
  }

  limit(count) {
    // Implementar limit no futuro se necessário
    return this;
  }

  insert(records) {
    const recordToInsert = Array.isArray(records) ? records[0] : records;

    return callProxy('insert', this.table, recordToInsert, null, this.selectColumns);
  }

  update(data) {
    // Converter filtersList em objeto de filtros
    const filters = {};
    this.filtersList.forEach(({ column, value }) => {
      filters[column] = value;
    });

    return callProxy('update', this.table, data, filters, this.selectColumns);
  }

  delete() {
    const filters = {};
    this.filtersList.forEach(({ column, value }) => {
      filters[column] = value;
    });

    return callProxy('delete', this.table, null, filters, '*');
  }

  // Quando usado com .then() direto (como em select)
  then(onFulfilled, onRejected) {
    const filters = {};
    this.filtersList.forEach(({ column, value }) => {
      filters[column] = value;
    });

    return callProxy('select', this.table, null, filters, this.selectColumns)
      .then(onFulfilled, onRejected);
  }
}

async function callProxy(action, table, data = null, filters = null, select = '*') {
  try {
    const response = await fetch('/api/supabase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        table,
        data,
        filters,
        select
      })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error(`❌ Erro ${action} ${table}:`, result.error);
      return { 
        data: null, 
        error: { 
          message: result.error, 
          details: result.details || '' 
        } 
      };
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error(`❌ Erro na chamada proxy (${action}):`, error);
    return { 
      data: null, 
      error: { 
        message: error.message, 
        details: error.toString() 
      } 
    };
  }
}

export const supabase = new SupabaseProxy();
