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
    // ⚠️ DEBUG: Mostrar variáveis de ambiente
    console.log('🔍 [Proxy Supabase] Verificando variáveis de ambiente:');
    console.log('   - VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Existe' : '❌ AUSENTE');
    console.log('   - VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Existe' : '❌ AUSENTE');

    // Validar variáveis de ambiente
    const supabaseUrl = process.env.VITE_SUPABASE_URL?.trim();
    const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('❌ ERRO CRÍTICO: Variáveis de ambiente não configuradas!');
      console.error('   Acesse: Vercel Dashboard → Seu Projeto → Settings → Environment Variables');
      console.error('   E configure:');
      console.error('     - VITE_SUPABASE_URL = https://nccsdktkkortxrthxxzrh.supabase.co');
      console.error('     - VITE_SUPABASE_ANON_KEY = sua_chave_aqui');
      
      return res.status(500).json({
        error: '❌ CONFIGURAÇÃO FALTANTE: Variáveis de ambiente não definidas no Vercel',
        help: 'Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em Settings → Environment Variables',
        urlSet: !!supabaseUrl,
        keySet: !!supabaseAnonKey,
        timestamp: new Date().toISOString()
      });
    }

    // Validar formato da URL
    if (!supabaseUrl.startsWith('https://')) {
      return res.status(500).json({
        error: 'URL do Supabase inválida: deve começar com https://',
        provided: supabaseUrl
      });
    }

    // Criar cliente Supabase
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { action, table, data, filters, select = '*', order } = req.body;

    console.log(`📍 [${new Date().toISOString()}] Action: ${action} | Table: ${table}`);

    let result;

    // ========== INSERT ==========
    if (action === 'insert') {
      console.log('📝 INSERT - Dados:', Object.keys(data || {}).join(', '));
      const { data: insertData, error } = await supabase
        .from(table)
        .insert([data])
        .select(select);

      if (error) {
        console.error('❌ INSERT Error:', error);
        throw error;
      }
      result = insertData;
      console.log('✅ INSERT OK:', insertData?.length || 0, 'registros');
    }

    // ========== SELECT ==========
    else if (action === 'select') {
      let query = supabase.from(table).select(select);

      // Aplicar filtros
      if (filters && Object.keys(filters).length > 0) {
        console.log('🔍 Filtros:', JSON.stringify(filters));
        for (const [column, value] of Object.entries(filters)) {
          query = query.eq(column, value);
        }
      }

      // Aplicar ordenação
      if (order?.column) {
        query = query.order(order.column, { ascending: order.ascending ?? true });
      }

      const { data: selectData, error } = await query;
      if (error) {
        console.error('❌ SELECT Error:', error);
        throw error;
      }
      result = selectData;
      console.log('✅ SELECT OK:', selectData?.length || 0, 'registros');
    }

    // ========== UPDATE ==========
    else if (action === 'update') {
      console.log('🔄 UPDATE - Dados:', Object.keys(data || {}).join(', '));
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
        console.error('❌ UPDATE Error:', error);
        throw error;
      }
      result = updateData;
      console.log('✅ UPDATE OK:', updateData?.length || 0, 'registros');
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
        console.error('❌ DELETE Error:', error);
        throw error;
      }
      result = { success: true };
      console.log('✅ DELETE OK');
    }

    else {
      return res.status(400).json({ error: `Action não reconhecida: ${action}` });
    }

    return res.status(200).json({ 
      data: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erro geral no proxy:', error.message);
    return res.status(500).json({
      error: error.message || 'Erro desconhecido',
      details: error.details || error.toString(),
      hint: error.hint || '',
      timestamp: new Date().toISOString()
    });
  }
}
