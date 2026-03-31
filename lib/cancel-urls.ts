export type CancelInfo = {
  url: string
  steps: string[]
  difficulty: 'easy' | 'medium' | 'hard'
  note?: string
}

export const CANCEL_INFO: Record<string, CancelInfo> = {
  netflix: {
    url: 'https://www.netflix.com/cancelplan',
    steps: [
      'Ve a tu cuenta en netflix.com',
      'Haz clic en tu perfil → "Cuenta"',
      'En "Membresia y facturacion", haz clic en "Cancelar membresia"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  spotify: {
    url: 'https://www.spotify.com/es/account/subscription/change/',
    steps: [
      'Visita spotify.com y abre tu cuenta',
      'Ve a "Suscripcion"',
      'Haz clic en "Cambiar plan" → "Cancelar Premium"',
      'Sigue los pasos de confirmacion',
    ],
    difficulty: 'easy',
  },
  amazon: {
    url: 'https://www.amazon.es/mc/pipelines/cancellation',
    steps: [
      'Ve a amazon.es → "Cuentas y listas" → "Prime"',
      'Haz clic en "Gestionar membresia Prime"',
      'Selecciona "Finalizar membresia y beneficios"',
      'Elige "Finalizar mis beneficios ahora" o al final del periodo',
    ],
    difficulty: 'easy',
    note: 'Puedes obtener reembolso si no has usado Prime recientemente',
  },
  'amazon prime': {
    url: 'https://www.amazon.es/mc/pipelines/cancellation',
    steps: [
      'Ve a amazon.es → "Cuentas y listas" → "Prime"',
      'Haz clic en "Gestionar membresia Prime"',
      'Selecciona "Finalizar membresia y beneficios"',
      'Elige "Finalizar mis beneficios ahora" o al final del periodo',
    ],
    difficulty: 'easy',
    note: 'Puedes obtener reembolso si no has usado Prime recientemente',
  },
  adobe: {
    url: 'https://account.adobe.com/plans',
    steps: [
      'Inicia sesion en account.adobe.com',
      'Ve a "Planes" → selecciona tu plan',
      'Haz clic en "Gestionar plan" → "Cancelar plan"',
      'Atencion: puede haber penalizacion por cancelacion anticipada',
    ],
    difficulty: 'medium',
    note: 'Adobe cobra un 50% del valor restante si cancelas antes del ano',
  },
  'adobe creative cloud': {
    url: 'https://account.adobe.com/plans',
    steps: [
      'Inicia sesion en account.adobe.com',
      'Ve a "Planes" → selecciona tu plan',
      'Haz clic en "Gestionar plan" → "Cancelar plan"',
      'Atencion: puede haber penalizacion por cancelacion anticipada',
    ],
    difficulty: 'medium',
    note: 'Adobe cobra un 50% del valor restante si cancelas antes del año',
  },
  chatgpt: {
    url: 'https://chat.openai.com/#settings/account',
    steps: [
      'Abre ChatGPT y haz clic en tu perfil',
      'Ve a "Configuracion" → "Mi plan"',
      'Haz clic en "Gestionar mi suscripcion"',
      'Selecciona "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  'chatgpt plus': {
    url: 'https://chat.openai.com/#settings/account',
    steps: [
      'Abre ChatGPT y haz clic en tu perfil',
      'Ve a "Configuracion" → "Mi plan"',
      'Haz clic en "Gestionar mi suscripcion"',
      'Selecciona "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  openai: {
    url: 'https://chat.openai.com/#settings/account',
    steps: [
      'Abre ChatGPT y haz clic en tu perfil',
      'Ve a "Configuracion" → "Mi plan"',
      'Haz clic en "Gestionar mi suscripcion"',
      'Selecciona "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  claude: {
    url: 'https://claude.ai/settings',
    steps: [
      'Inicia sesion en claude.ai',
      'Ve a Configuracion → "Plan y uso"',
      'Haz clic en "Gestionar suscripcion"',
      'Selecciona "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  'claude pro': {
    url: 'https://claude.ai/settings',
    steps: [
      'Inicia sesion en claude.ai',
      'Ve a Configuracion → "Plan y uso"',
      'Haz clic en "Gestionar suscripcion"',
      'Selecciona "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  anthropic: {
    url: 'https://claude.ai/settings',
    steps: [
      'Inicia sesion en claude.ai',
      'Ve a Configuracion → "Plan y uso"',
      'Haz clic en "Gestionar suscripcion"',
      'Selecciona "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  icloud: {
    url: 'https://support.apple.com/es-es/108904',
    steps: [
      'En iPhone: Ajustes → tu nombre → iCloud → Almacenamiento en iCloud',
      'Toca "Cambiar plan de almacenamiento"',
      'Selecciona "Opcion gratuita de 5 GB"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
  },
  youtube: {
    url: 'https://www.youtube.com/paid_memberships',
    steps: [
      'Ve a youtube.com → tu perfil → "Compras y membresias"',
      'Haz clic en "Gestionar" junto a YouTube Premium',
      'Selecciona "Desactivar la renovacion automatica"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  'youtube premium': {
    url: 'https://www.youtube.com/paid_memberships',
    steps: [
      'Ve a youtube.com → tu perfil → "Compras y membresias"',
      'Haz clic en "Gestionar" junto a YouTube Premium',
      'Selecciona "Desactivar la renovacion automatica"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  disney: {
    url: 'https://www.disneyplus.com/account',
    steps: [
      'Inicia sesion en disneyplus.com',
      'Ve a tu perfil → "Cuenta"',
      'En "Suscripcion", haz clic en "Cancelar suscripcion"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  'disney+': {
    url: 'https://www.disneyplus.com/account',
    steps: [
      'Inicia sesion en disneyplus.com',
      'Ve a tu perfil → "Cuenta"',
      'En "Suscripcion", haz clic en "Cancelar suscripcion"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  hbo: {
    url: 'https://www.max.com/account/subscription',
    steps: [
      'Inicia sesion en max.com',
      'Ve a tu perfil → "Cuenta"',
      'Haz clic en "Cancelar plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  'hbo max': {
    url: 'https://www.max.com/account/subscription',
    steps: [
      'Inicia sesion en max.com',
      'Ve a tu perfil → "Cuenta"',
      'Haz clic en "Cancelar plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  notion: {
    url: 'https://www.notion.so/my-account',
    steps: [
      'Ve a notion.so → Configuracion y miembros',
      'Selecciona "Plan"',
      'Haz clic en "Cancelar plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  figma: {
    url: 'https://www.figma.com/settings#plan',
    steps: [
      'Ve a figma.com → Configuracion de la cuenta',
      'Selecciona "Plan y facturacion"',
      'Haz clic en "Cancelar plan"',
    ],
    difficulty: 'easy',
  },
  dropbox: {
    url: 'https://www.dropbox.com/account/billing',
    steps: [
      'Inicia sesion en dropbox.com',
      'Ve a Configuracion → Facturacion',
      'Haz clic en "Cancelar plan"',
      'Sigue las instrucciones',
    ],
    difficulty: 'easy',
  },
  github: {
    url: 'https://github.com/settings/billing/plans',
    steps: [
      'Ve a github.com → Configuracion → Facturacion y planes',
      'En tu plan actual, haz clic en "Bajar a Free"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
  },
  'github copilot': {
    url: 'https://github.com/settings/copilot',
    steps: [
      'Ve a github.com → Configuracion → GitHub Copilot',
      'Haz clic en "Gestionar Copilot"',
      'Selecciona "Cancelar suscripcion"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
  },
  microsoft: {
    url: 'https://account.microsoft.com/services',
    steps: [
      'Ve a account.microsoft.com',
      'Selecciona "Servicios y suscripciones"',
      'Encuentra tu suscripcion y haz clic en "Cancelar"',
      'Sigue los pasos de confirmacion',
    ],
    difficulty: 'easy',
  },
  'microsoft 365': {
    url: 'https://account.microsoft.com/services',
    steps: [
      'Ve a account.microsoft.com',
      'Selecciona "Servicios y suscripciones"',
      'Encuentra Microsoft 365 y haz clic en "Cancelar"',
      'Sigue los pasos de confirmacion',
    ],
    difficulty: 'easy',
  },
  apple: {
    url: 'https://support.apple.com/es-es/118428',
    steps: [
      'En iPhone: Ajustes → tu nombre → Suscripciones',
      'Selecciona la suscripcion que quieres cancelar',
      'Toca "Cancelar suscripcion"',
      'Confirma',
    ],
    difficulty: 'easy',
  },
  slack: {
    url: 'https://slack.com/intl/es-es/help/articles/214908208',
    steps: [
      'Ve a tu espacio de trabajo en Slack',
      'Haz clic en el nombre del espacio → "Configuracion y administracion" → "Facturacion"',
      'Selecciona "Cambiar plan" → plan gratuito',
    ],
    difficulty: 'medium',
  },
  zoom: {
    url: 'https://zoom.us/billing',
    steps: [
      'Inicia sesion en zoom.us',
      'Ve a "Administracion de facturacion"',
      'Haz clic en "Cancelar suscripcion"',
      'Sigue el proceso de confirmacion',
    ],
    difficulty: 'easy',
  },
  canva: {
    url: 'https://www.canva.com/settings/billing',
    steps: [
      'Inicia sesion en canva.com',
      'Ve a Configuracion → Facturacion y planes',
      'Haz clic en "Cancelar plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  twitch: {
    url: 'https://www.twitch.tv/subscriptions',
    steps: [
      'Inicia sesion en twitch.tv',
      'Ve a tu perfil → "Suscripciones"',
      'Haz clic en la suscripcion → "No renovar"',
      'Confirma',
    ],
    difficulty: 'easy',
  },
  linkedin: {
    url: 'https://www.linkedin.com/premium/products/',
    steps: [
      'Ve a linkedin.com → tu foto → "Premium" → "Gestionar suscripcion Premium"',
      'Haz clic en "Cancelar suscripcion"',
      'Sigue los pasos (LinkedIn intentara retenerte con ofertas)',
    ],
    difficulty: 'medium',
    note: 'LinkedIn suele ofrecer descuentos del 50% antes de cancelar',
  },
  'linkedin premium': {
    url: 'https://www.linkedin.com/premium/products/',
    steps: [
      'Ve a linkedin.com → tu foto → "Premium" → "Gestionar suscripcion Premium"',
      'Haz clic en "Cancelar suscripcion"',
      'Sigue los pasos (LinkedIn intentara retenerte con ofertas)',
    ],
    difficulty: 'medium',
    note: 'LinkedIn suele ofrecer descuentos del 50% antes de cancelar',
  },
  duolingo: {
    url: 'https://www.duolingo.com/settings/subscription',
    steps: [
      'En la app: ve a tu perfil → "Super Duolingo"',
      'Selecciona "Gestionar suscripcion"',
      'Toca "Cancelar suscripcion"',
    ],
    difficulty: 'easy',
  },
  paramount: {
    url: 'https://www.paramountplus.com/account/account-overview/subscriptions/',
    steps: [
      'Inicia sesion en paramountplus.com',
      'Ve a Cuenta → Suscripciones',
      'Haz clic en "Cancelar suscripcion"',
      'Confirma',
    ],
    difficulty: 'easy',
  },
  hulu: {
    url: 'https://secure.hulu.com/account/cancel',
    steps: [
      'Inicia sesion en hulu.com',
      'Ve a tu cuenta → "Cancelar"',
      'Sigue el proceso de cancelacion',
    ],
    difficulty: 'easy',
  },
  apple_tv: {
    url: 'https://support.apple.com/es-es/118428',
    steps: [
      'En iPhone: Ajustes → tu nombre → Suscripciones',
      'Selecciona "Apple TV+"',
      'Toca "Cancelar suscripcion"',
    ],
    difficulty: 'easy',
  },
  apple_music: {
    url: 'https://support.apple.com/es-es/118428',
    steps: [
      'En iPhone: Ajustes → tu nombre → Suscripciones',
      'Selecciona "Apple Music"',
      'Toca "Cancelar suscripcion"',
    ],
    difficulty: 'easy',
  },
  grammarly: {
    url: 'https://account.grammarly.com/subscription',
    steps: [
      'Inicia sesion en grammarly.com',
      'Ve a "Mi cuenta" → "Suscripcion"',
      'Haz clic en "Cancelar suscripcion"',
    ],
    difficulty: 'easy',
  },
  pcloud: {
    url: 'https://my.pcloud.com/#page=account&settings=subscriptions',
    steps: [
      'Inicia sesion en my.pcloud.com',
      'Ve a Cuenta → Suscripciones',
      'Cancela desde ahi',
    ],
    difficulty: 'easy',
  },
  // IA Tools
  elevenlabs: {
    url: 'https://elevenlabs.io/subscription',
    steps: [
      'Inicia sesion en elevenlabs.io',
      'Ve a tu perfil → "Subscription"',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  heygen: {
    url: 'https://app.heygen.com/settings/billing',
    steps: [
      'Inicia sesion en app.heygen.com',
      'Ve a Settings → Billing',
      'Haz clic en "Cancel Plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  runway: {
    url: 'https://app.runwayml.com/settings/billing',
    steps: [
      'Inicia sesion en app.runwayml.com',
      'Ve a Settings → Billing',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  'runway ml': {
    url: 'https://app.runwayml.com/settings/billing',
    steps: [
      'Inicia sesion en app.runwayml.com',
      'Ve a Settings → Billing',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  suno: {
    url: 'https://suno.com/account',
    steps: [
      'Inicia sesion en suno.com',
      'Ve a tu cuenta → "Subscription"',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  'suno pro': {
    url: 'https://suno.com/account',
    steps: [
      'Inicia sesion en suno.com',
      'Ve a tu cuenta → "Subscription"',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  midjourney: {
    url: 'https://www.midjourney.com/account/',
    steps: [
      'Ve a midjourney.com/account',
      'Haz clic en "Manage Subscription"',
      'Selecciona "Cancel Plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  perplexity: {
    url: 'https://www.perplexity.ai/settings/account',
    steps: [
      'Inicia sesion en perplexity.ai',
      'Ve a Settings → Account',
      'Haz clic en "Manage subscription"',
      'Selecciona "Cancel subscription"',
    ],
    difficulty: 'easy',
  },
  cursor: {
    url: 'https://cursor.sh/settings',
    steps: [
      'Inicia sesion en cursor.sh',
      'Ve a Settings → Billing',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  // Cloud & Hosting
  supabase: {
    url: 'https://supabase.com/dashboard/account/billing',
    steps: [
      'Inicia sesion en supabase.com/dashboard',
      'Ve a tu organizacion → Settings → Billing',
      'Haz clic en "Downgrade to Free"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
    note: 'Si tienes proyectos en plan Pro, seran pausados al cambiar a Free',
  },
  'supabase pro': {
    url: 'https://supabase.com/dashboard/account/billing',
    steps: [
      'Inicia sesion en supabase.com/dashboard',
      'Ve a tu organizacion → Settings → Billing',
      'Haz clic en "Downgrade to Free"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
    note: 'Si tienes proyectos en plan Pro, seran pausados al cambiar a Free',
  },
  vercel: {
    url: 'https://vercel.com/account/billing',
    steps: [
      'Inicia sesion en vercel.com',
      'Ve a Account Settings → Billing',
      'Haz clic en "Downgrade to Hobby"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
  },
  railway: {
    url: 'https://railway.app/account/billing',
    steps: [
      'Inicia sesion en railway.app',
      'Ve a Account → Billing',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  cloudflare: {
    url: 'https://dash.cloudflare.com/profile/billing',
    steps: [
      'Inicia sesion en dash.cloudflare.com',
      'Ve a Profile → Billing',
      'Cancela el plan o servicio especifico',
    ],
    difficulty: 'medium',
  },
  // Stock Media
  storyblocks: {
    url: 'https://www.storyblocks.com/account/membership',
    steps: [
      'Inicia sesion en storyblocks.com',
      'Ve a Account → Membership',
      'Haz clic en "Cancel membership"',
      'Sigue el proceso de cancelacion',
    ],
    difficulty: 'medium',
    note: 'Storyblocks puede intentar ofrecerte pausar en lugar de cancelar',
  },
  videoblocks: {
    url: 'https://www.storyblocks.com/account/membership',
    steps: [
      'Inicia sesion en storyblocks.com',
      'Ve a Account → Membership',
      'Haz clic en "Cancel membership"',
      'Sigue el proceso de cancelacion',
    ],
    difficulty: 'medium',
  },
  audioblocks: {
    url: 'https://www.storyblocks.com/account/membership',
    steps: [
      'Inicia sesion en storyblocks.com',
      'Ve a Account → Membership',
      'Haz clic en "Cancel membership"',
      'Sigue el proceso de cancelacion',
    ],
    difficulty: 'medium',
  },
  // Other common services
  base44: {
    url: 'https://base44.com/settings/billing',
    steps: [
      'Inicia sesion en base44.com',
      'Ve a Settings → Billing',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  loom: {
    url: 'https://www.loom.com/settings/plans',
    steps: [
      'Inicia sesion en loom.com',
      'Ve a Settings → Plans',
      'Haz clic en "Cancel plan"',
      'Confirma la cancelacion',
    ],
    difficulty: 'easy',
  },
  airtable: {
    url: 'https://airtable.com/account',
    steps: [
      'Inicia sesion en airtable.com',
      'Ve a Account → Billing',
      'Haz clic en "Downgrade to Free"',
      'Confirma el cambio',
    ],
    difficulty: 'easy',
  },
  monday: {
    url: 'https://monday.com/account/billing',
    steps: [
      'Inicia sesion en monday.com',
      'Ve a Admin → Billing',
      'Haz clic en "Cancel plan"',
      'Sigue el proceso de cancelacion',
    ],
    difficulty: 'medium',
  },
  asana: {
    url: 'https://app.asana.com/admin',
    steps: [
      'Inicia sesion en asana.com',
      'Ve a Admin → Billing',
      'Haz clic en "Cancel subscription"',
      'Confirma la cancelacion',
    ],
    difficulty: 'medium',
  },
  todoist: {
    url: 'https://todoist.com/app/settings/subscription',
    steps: [
      'Inicia sesion en todoist.com',
      'Ve a Settings → Subscription',
      'Haz clic en "Cancel subscription"',
    ],
    difficulty: 'easy',
  },
  evernote: {
    url: 'https://www.evernote.com/client/account',
    steps: [
      'Inicia sesion en evernote.com',
      'Ve a Account → Billing',
      'Haz clic en "Cancel subscription"',
    ],
    difficulty: 'easy',
  },
}

export function getCancelInfo(serviceName: string): CancelInfo | null {
  const key = serviceName.toLowerCase().trim()
  // Direct match
  if (CANCEL_INFO[key]) return CANCEL_INFO[key]
  // Partial match: key includes service or service includes key
  for (const [k, v] of Object.entries(CANCEL_INFO)) {
    if (key.includes(k) || k.includes(key)) return v
  }
  return null
}

export const DIFFICULTY_LABELS = {
  easy: { label: 'Facil', color: '#10B981' },
  medium: { label: 'Moderado', color: '#F59E0B' },
  hard: { label: 'Dificil', color: '#F43F5E' },
}
