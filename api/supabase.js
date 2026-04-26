import { createClient } from '@supabase/supabase-js';

// Proxy API para requisições do Supabase
// Permite que o frontend faça requisições através do backend, evitando CORS e problemas de DNS
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Validar variáveis de ambiente
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

    console.log('🔍 Proxy Supabase - Verificando variáveis de ambiente:');
    console.log('  - VITE_SUPABASE_URL:', supabaseUrl ? '✅ Carregada' : '❌ NÃO CARREGADA');
    console.log('  - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Carregada' : '❌ NÃO CARREGADA');

    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        error: 'Variáveis de ambiente do Supabase não configuradas no Vercel',
        details: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em Vercel → Settings → Environment Variables',
        url: supabaseUrl || undefined,
        keyExists: !!supabaseAnonKey
      });
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { action, table, data, filters, select = '*' } = req.body;

    console.log(`🔹 [${new Date().toISOString()}] Action: ${action} | Table: ${table} | Select: ${select}`);

    let result;

    // ========== INSERT ==========
    if (action === 'insert') {
      console.log('📝 INSERT com dados:', JSON.stringify(data).substring(0, 100));
      const { data: insertData, error } = await supabase
        .from(table)
        .insert([data])
        .select(select);

      if (error) {
        console.error('❌ Erro INSERT:', error);
        throw error;
      }
      result = insertData;
      console.log('✅ INSERT sucesso:', insertData?.length || 0, 'registros');
    }

    // ========== SELECT ==========
    else if (action === 'select') {
      let query = supabase.from(table).select(select);

      // Aplicar filtros
      if (filters && Object.keys(filters).length > 0) {
        console.log('🔍 Filtros aplicados:', JSON.stringify(filters));
        for (const [column, value] of Object.entries(filters)) {
          query = query.eq(column, value);
        }
      }

      const { data: selectData, error } = await query;
      if (error) {
        console.error('❌ Erro SELECT:', error);
        throw error;
      }
      result = selectData;
      console.log('✅ SELECT sucesso:', selectData?.length || 0, 'registros');
    }

    // ========== UPDATE ==========
    else if (action === 'update') {
      console.log('🔄 UPDATE com dados:', JSON.stringify(data).substring(0, 100));
      if (!filters || Object.keys(filters).length === 0) {
        throw new Error('UPDATE requer filtros (ex: WHERE id = ...)');
      }

      let query = supabase.from(table).update(data);

      // Aplicar filtros
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }

      const { data: updateData, error } = await query.select(select);
      if (error) {
        console.error('❌ Erro UPDATE:', error);
        throw error;
      }
      result = updateData;
      console.log('✅ UPDATE sucesso:', updateData?.length || 0, 'registros');
    }

    // ========== DELETE ==========
    else if (action === 'delete') {
      if (!filters || Object.keys(filters).length === 0) {
        throw new Error('DELETE requer filtros (ex: WHERE id = ...)');
      }

      let query = supabase.from(table);

      // Aplicar filtros
      for (const [column, value] of Object.entries(filters)) {
        query = query.eq(column, value);
      }

      const { error } = await query.delete();
      if (error) {
        console.error('❌ Erro DELETE:', error);
        throw error;
      }
      result = { success: true };
      console.log('✅ DELETE sucesso');
    }

    else {
      return res.status(400).json({ error: `Action não reconhecida: ${action}` });
    }

    return res.status(200).json({ 
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro geral no proxy Supabase:', error);
    return res.status(500).json({
      error: error.message || 'Erro desconhecido',
      details: error.details || error.toString(),
      hint: error.hint || ''
    });
  }
}
