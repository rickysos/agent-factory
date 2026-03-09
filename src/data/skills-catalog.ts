export interface Skill {
  id: string
  name: string
  description: string
  category: string
  requiresAuth: boolean
  authType?: 'api_key' | 'oauth' | 'token'
}

export const skillsCatalog: Skill[] = [
  { id: 'apple-notes', name: 'Apple Notes', description: 'Read, create, and search Apple Notes on macOS', category: 'Productivity', requiresAuth: false },
  { id: 'reminders', name: 'Reminders', description: 'Manage Apple Reminders lists and items', category: 'Productivity', requiresAuth: false },
  { id: 'bear-notes', name: 'Bear Notes', description: 'Access and manage notes in Bear app via x-callback-url', category: 'Productivity', requiresAuth: false },
  { id: 'notion', name: 'Notion', description: 'Read and write Notion pages, databases, and blocks', category: 'Productivity', requiresAuth: false },
  { id: 'obsidian', name: 'Obsidian', description: 'Interact with Obsidian vaults for markdown note management', category: 'Productivity', requiresAuth: false },
  { id: 'things3', name: 'Things 3', description: 'Create and manage tasks and projects in Things 3', category: 'Productivity', requiresAuth: false },
  { id: 'trello', name: 'Trello', description: 'Manage Trello boards, lists, and cards', category: 'Productivity', requiresAuth: false },

  { id: 'imessage', name: 'iMessage', description: 'Send and read iMessages via the Messages app', category: 'Communication', requiresAuth: false },
  { id: 'slack', name: 'Slack', description: 'Send messages, read channels, and manage Slack workspaces', category: 'Communication', requiresAuth: true, authType: 'oauth' },
  { id: 'whatsapp', name: 'WhatsApp', description: 'Send and receive WhatsApp messages', category: 'Communication', requiresAuth: false },
  { id: 'voice-call', name: 'Voice Call', description: 'Initiate and manage voice calls programmatically', category: 'Communication', requiresAuth: false },
  { id: 'email-himalaya', name: 'Email/Himalaya', description: 'Read, send, and manage email via the Himalaya CLI client', category: 'Communication', requiresAuth: true, authType: 'api_key' },

  { id: 'github', name: 'GitHub', description: 'Manage repos, issues, PRs, and actions on GitHub', category: 'Development', requiresAuth: true, authType: 'api_key' },
  { id: 'coding-agent', name: 'Coding Agent', description: 'Autonomous code generation, refactoring, and debugging agent', category: 'Development', requiresAuth: false },
  { id: 'gemini-cli', name: 'Gemini CLI', description: 'Access Google Gemini models via command line interface', category: 'Development', requiresAuth: true, authType: 'api_key' },
  { id: 'tmux', name: 'Tmux', description: 'Manage terminal multiplexer sessions and panes', category: 'Development', requiresAuth: false },

  { id: 'spotify', name: 'Spotify', description: 'Control playback, search music, and manage playlists on Spotify', category: 'Media', requiresAuth: true, authType: 'oauth' },
  { id: 'sonos', name: 'Sonos', description: 'Control Sonos speakers for playback and grouping', category: 'Media', requiresAuth: false },
  { id: 'bluos', name: 'BluOS', description: 'Control BluOS-enabled speakers and streamers', category: 'Media', requiresAuth: false },
  { id: 'songsee', name: 'SongSee', description: 'Identify currently playing songs using audio fingerprinting', category: 'Media', requiresAuth: false },
  { id: 'openai-images', name: 'OpenAI Images', description: 'Generate and edit images using OpenAI DALL-E models', category: 'Media', requiresAuth: true, authType: 'api_key' },
  { id: 'video-frames', name: 'Video Frames', description: 'Extract and analyze individual frames from video files', category: 'Media', requiresAuth: false },
  { id: 'gifgrep', name: 'GifGrep', description: 'Search and retrieve GIFs by keyword or description', category: 'Media', requiresAuth: false },

  { id: 'philips-hue', name: 'Philips Hue', description: 'Control Philips Hue smart lights, scenes, and rooms', category: 'Smart Home', requiresAuth: true, authType: 'api_key' },
  { id: 'eight-sleep', name: 'Eight Sleep', description: 'Control Eight Sleep pod temperature and view sleep data', category: 'Smart Home', requiresAuth: true, authType: 'api_key' },

  { id: 'whisper-local', name: 'Whisper Local', description: 'Transcribe audio to text locally using OpenAI Whisper', category: 'AI/ML', requiresAuth: false },
  { id: 'elevenlabs-tts', name: 'ElevenLabs TTS', description: 'Generate natural speech from text using ElevenLabs voices', category: 'AI/ML', requiresAuth: true, authType: 'api_key' },
  { id: 'sherpa-onnx-tts', name: 'Sherpa ONNX TTS', description: 'Run text-to-speech locally using Sherpa ONNX runtime', category: 'AI/ML', requiresAuth: false },

  { id: 'weather', name: 'Weather', description: 'Get current weather and forecasts for any location', category: 'Utilities', requiresAuth: true, authType: 'api_key' },
  { id: 'google-places', name: 'Google Places', description: 'Search for places, get details, and find nearby locations', category: 'Utilities', requiresAuth: true, authType: 'api_key' },
  { id: 'local-places', name: 'Local Places', description: 'Discover nearby businesses and points of interest offline', category: 'Utilities', requiresAuth: false },
  { id: 'blogwatcher', name: 'Blogwatcher', description: 'Monitor RSS feeds and blogs for new content', category: 'Utilities', requiresAuth: false },
  { id: 'summarize', name: 'Summarize', description: 'Generate concise summaries of long text or web pages', category: 'Utilities', requiresAuth: false },
  { id: 'nano-pdf', name: 'Nano PDF', description: 'Extract text and data from PDF documents', category: 'Utilities', requiresAuth: false },
  { id: 'camsnap', name: 'CamSnap', description: 'Capture photos from connected cameras on demand', category: 'Utilities', requiresAuth: false },
  { id: 'peekaboo', name: 'Peekaboo', description: 'Take screenshots of the current screen or specific windows', category: 'Utilities', requiresAuth: false },

  { id: 'healthcheck', name: 'Healthcheck', description: 'Monitor health and status of running agents and services', category: 'System', requiresAuth: false },
  { id: 'session-logs', name: 'Session Logs', description: 'View and search agent session history and logs', category: 'System', requiresAuth: false },
  { id: 'model-usage', name: 'Model Usage', description: 'Track token usage and costs across AI model providers', category: 'System', requiresAuth: false },
  { id: 'skill-creator', name: 'Skill Creator', description: 'Build and register new skills for agents dynamically', category: 'System', requiresAuth: false },
  { id: 'mcporter', name: 'MCPorter', description: 'Import and export MCP server configurations', category: 'System', requiresAuth: false },
  { id: 'clawhub', name: 'ClawHub', description: 'Browse and install community-shared agent configurations', category: 'System', requiresAuth: false },
]

export const categories = [
  'Productivity',
  'Communication',
  'Development',
  'Media',
  'Smart Home',
  'AI/ML',
  'Utilities',
  'System',
] as const
