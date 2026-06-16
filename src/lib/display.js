// src/lib/display.js
// Shared presentation helpers used by MatchCard and the Predictions page.

const FLAG_MAP = {
  'United States': '🇺🇸', 'Canada': '🇨🇦', 'Mexico': '🇲🇽',
  'Brazil': '🇧🇷', 'Argentina': '🇦🇷', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴',
  'Germany': '🇩🇪', 'France': '🇫🇷', 'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Belgium': '🇧🇪', 'Italy': '🇮🇹',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Australia': '🇦🇺',
  'Morocco': '🇲🇦', 'Senegal': '🇸🇳', 'Nigeria': '🇳🇬',
  'Saudi Arabia': '🇸🇦', 'Iran': '🇮🇷', 'Qatar': '🇶🇦',
  'Croatia': '🇭🇷', 'Serbia': '🇷🇸', 'Poland': '🇵🇱',
  'Switzerland': '🇨🇭', 'Denmark': '🇩🇰', 'Ecuador': '🇪🇨',
  'Cameroon': '🇨🇲', 'Ghana': '🇬🇭', 'Tunisia': '🇹🇳',
  'Costa Rica': '🇨🇷', 'Panama': '🇵🇦', 'Honduras': '🇭🇳',
  'Venezuela': '🇻🇪', 'Peru': '🇵🇪', 'Chile': '🇨🇱',
  'Austria': '🇦🇹', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Czech Republic': '🇨🇿', 'Hungary': '🇭🇺', 'Slovakia': '🇸🇰',
  'Slovenia': '🇸🇮', 'Albania': '🇦🇱', 'Romania': '🇷🇴',
  'Turkey': '🇹🇷', 'Ukraine': '🇺🇦', 'Greece': '🇬🇷',
  'Egypt': '🇪🇬', 'Algeria': '🇩🇿', 'Mali': '🇲🇱',
  'Ivory Coast': '🇨🇮', 'Zambia': '🇿🇲', 'South Africa': '🇿🇦',
  'New Zealand': '🇳🇿', 'Indonesia': '🇮🇩',
  'Iraq': '🇮🇶', 'Jordan': '🇯🇴', 'Uzbekistan': '🇺🇿',
  'China PR': '🇨🇳',
}

export function getFlag(teamName) {
  return FLAG_MAP[teamName] || '🏳️'
}

export function formatDate(utcDate) {
  const d = new Date(utcDate)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
