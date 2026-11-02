import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useT } from '../components/Language.jsx';
import { Section } from '../components/parts.jsx';
import { LEAGUES } from '../data.js';
import { leaderboard } from '../game.js';
import { today, useMilo } from '../store.jsx';

const MEDALS = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function League() {
  const t = useT();
  const { game, profile } = useMilo().store;
  const league = LEAGUES[game.league.index];
  const board = leaderboard(game, today(), { nickname: profile.nickname });
  const last = game.league.lastResult;
  const me = board.find((r) => r.me);
  const gap = board[2].xp - me.xp + 1;
  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', display: 'grid', gap: 1.5 }}>
      <Box sx={(t) => ({ background: t.vars.palette.milo.heroGradient, borderRadius: 3, p: 2.25 })}>
        <Typography variant="h1">{t('league.title', { emoji: league.emoji, league: t(`league.${league.id}`) })}</Typography>
        <Typography sx={{ fontWeight: 800, mt: 0.5 }}>
          {t('league.place', { rank: me.rank })} · {me.rank <= 3 ? t('league.onTrack') : t('league.gap', { xp: gap })}
        </Typography>
        <Typography variant="body2">{t('league.rules')}</Typography>
      </Box>
      {last && (
        <Section tone="note">
          <Typography variant="body2">{t(last.promoted ? 'league.lastWeekUp' : 'league.lastWeek', { rank: last.rank })}</Typography>
        </Section>
      )}
      <Section>
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {board.map((r) => (
            <Box
              component="li"
              key={r.name + r.rank}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.25, px: 1, py: 0.9,
                borderTop: r.rank === 1 ? 0 : r.rank === 4 ? '3px dashed' : 1.5,
                borderColor: r.rank === 4 ? 'secondary.main' : 'divider',
                ...(r.me && { bgcolor: 'primary.light', borderRadius: 2, fontWeight: 800 }),
              }}
            >
              <Box sx={{ width: 26, textAlign: 'center', fontWeight: 800, fontSize: MEDALS[r.rank] ? '1.25rem' : undefined }}>{MEDALS[r.rank] ?? r.rank}</Box>
              <Avatar sx={{ width: 34, height: 34, fontSize: '.95rem', fontWeight: 800, bgcolor: r.me ? 'primary.main' : 'milo.muted', color: r.me ? 'primary.contrastText' : 'text.primary' }}>
                {r.me ? '🐾' : r.name[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere' }}>{r.name}{r.bot ? ' 🤖' : ''}</Box>
              <b>{r.xp} XP</b>
            </Box>
          ))}
        </Box>
      </Section>
      <Typography variant="body2" color="text.secondary">{t('league.bots')}</Typography>
    </Box>
  );
}
