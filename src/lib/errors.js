// Traduz erros comuns do Supabase Auth para mensagens claras em português.
export function authMessage(raw) {
    const m = (raw ?? "").toLowerCase();
    if (m.includes("invalid login credentials"))
        return "E-mail ou senha incorretos. Confira e tente de novo.";
    if (m.includes("already registered") || m.includes("already been registered"))
        return "Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.";
    if (m.includes("email not confirmed"))
        return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
    if (m.includes("password should be at least"))
        return "A senha precisa ter pelo menos 8 caracteres.";
    if (m.includes("rate limit") || m.includes("too many"))
        return "Muitas tentativas. Aguarde um pouco e tente novamente.";
    if (m.includes("failed to fetch") || m.includes("network"))
        return "Sem conexão com o servidor. Verifique sua internet.";
    return "Não foi possível concluir. Tente novamente em instantes.";
}
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
