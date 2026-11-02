import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Bear from '../components/Bear.jsx';
import { LanguageSelect, useT } from '../components/Language.jsx';
import {
  BearStage, Choice, PrognosisCard, Section, WeekList, parseNumber,
} from '../components/parts.jsx';
import { MIN_AGE, assess, validateWeightGoal } from '../health.js';
import { GOALS, LEVELS, buildPlan } from '../plan.js';
import { today, useMilo } from '../store.jsx';

const LAST_STEP = 5;
const BLOCKED = ['already_healthy', 'already_upper'];
const EMPTY = {
  nickname: '', age: '', sex: '', heightCm: '', weightKg: '', goal: '', targetKg: '', level: 0, daysPerWeek: 3,
};

const numbers = (draft) => ({
  ...draft,
  age: parseNumber(draft.age),
  heightCm: parseNumber(draft.heightCm),
  weightKg: parseNumber(draft.weightKg),
  targetKg: parseNumber(draft.targetKg),
});

function toProfile(draft) {
  const p = numbers(draft);
  const profile = {
    nickname: draft.nickname.trim(),
    age: p.age,
    sex: draft.sex,
    heightCm: p.heightCm,
    weightKg: p.weightKg,
    goal: draft.goal,
    level: Number(draft.level),
    daysPerWeek: Number(draft.daysPerWeek),
  };
  if (GOALS[draft.goal].weight) profile.targetKg = p.targetKg;
  return profile;
}

const goalMessage = (t, check) => t(`weightGoal.${check.code}`, { kg: t.number(check.limitKg) });

function validate(step, draft, t) {
  const p = numbers(draft);
  if (step === 1) {
    if (!draft.nickname.trim()) return t('onboarding.errorName');
    if (!Number.isInteger(p.age) || p.age < 1 || p.age > 99) return t('onboarding.errorAge');
    if (p.age < MIN_AGE) return t('onboarding.errorMinAge', { age: MIN_AGE });
    if (!draft.sex) return t('onboarding.errorSex');
  }
  if (step === 2) {
    if (!(p.heightCm >= 120 && p.heightCm <= 220)) return t('onboarding.errorHeight');
    if (!(p.weightKg >= 25 && p.weightKg <= 200)) return t('common.weightError');
  }
  if (step === 3) {
    if (!draft.goal) return t('onboarding.errorGoal');
    if (GOALS[draft.goal].weight) {
      const check = validateWeightGoal(p, draft.goal, p.targetKg);
      if (!check.ok) return goalMessage(t, check);
    }
  }
  if (step === 4 && !draft.level) return t('onboarding.errorLevel');
  return '';
}

function GoalStep({ draft, set }) {
  const t = useT();
  const weightGoal = draft.goal && GOALS[draft.goal].weight;
  const p = numbers(draft);
  const check = weightGoal ? validateWeightGoal(p, draft.goal, p.targetKg) : null;
  const range = assess(p);

  const chooseGoal = (goal) => {
    const suggestion = GOALS[goal].weight ? validateWeightGoal(p, goal, Number.NaN).suggestedKg : '';
    set({ goal, targetKg: suggestion ?? '' });
  };

  return (
    <>
      <Typography variant="h1">{t('onboarding.goalTitle')}</Typography>
      <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }}>
        {Object.entries(GOALS).map(([id, g]) => (
          <Choice key={id} title={`${g.emoji} ${t(`goal.${id}.label`)}`} text={t(`goal.${id}.text`)} selected={draft.goal === id} onClick={() => chooseGoal(id)} data-goal={id} />
        ))}
      </Box>
      {check && BLOCKED.includes(check.code) && <Section tone="note"><Typography>{goalMessage(t, check)}</Typography></Section>}
      {check && !BLOCKED.includes(check.code) && (
        <>
          <TextField
            label={t('onboarding.targetWeight')}
            value={draft.targetKg}
            onChange={(e) => set({ targetKg: e.target.value })}
            slotProps={{ htmlInput: { inputMode: 'decimal', id: 'targetKg' } }}
          />
          <Typography variant="body2" color="text.secondary">
            {t('onboarding.healthyRange', { min: t.number(range.minHealthyKg), max: t.number(range.maxHealthyKg) })}
          </Typography>
        </>
      )}
    </>
  );
}

export default function Onboarding() {
  const t = useT();
  const {
    store, editing, setEditing, saveProfile,
  } = useMilo();
  const [draft, setDraft] = useState(() => (store.profile ? { ...EMPTY, ...store.profile } : EMPTY));
  const [step, setStep] = useState(store.profile ? 1 : 0);
  const [error, setError] = useState('');

  const set = (patch) => {
    setDraft((d) => ({ ...d, ...patch }));
    setError('');
  };
  const field = (name, label, inputMode, extra = {}) => (
    <TextField
      label={label}
      value={draft[name]}
      onChange={(e) => set({ [name]: e.target.value })}
      slotProps={{ htmlInput: { inputMode, id: name, ...extra } }}
    />
  );

  const next = () => {
    const message = validate(step, draft, t);
    if (message) {
      setError(message);
      return;
    }
    if (step === LAST_STEP) {
      saveProfile(toProfile(draft));
      return;
    }
    setStep(step + 1);
    window.scrollTo(0, 0);
  };

  const blocked = step === 3 && draft.goal && GOALS[draft.goal].weight
    && BLOCKED.includes(validateWeightGoal(numbers(draft), draft.goal, parseNumber(draft.targetKg)).code);

  let body = null;
  if (step === 0) {
    body = (
      <>
        <Box sx={(t) => ({ background: t.vars.palette.milo.heroGradient, borderRadius: 3, py: 2 })}>
          <BearStage sx={{ width: 'min(220px, 30dvh)', mx: 'auto' }}><Bear /></BearStage>
        </Box>
        <LanguageSelect />
        <Typography variant="h1" sx={{ textAlign: 'center' }}>{t('onboarding.hello')}</Typography>
        <Typography sx={{ textAlign: 'center' }}>{t('onboarding.intro')}</Typography>
        <Section tone="note">
          <Typography variant="body2">{t('onboarding.notice')}</Typography>
        </Section>
      </>
    );
  }
  if (step === 1) {
    body = (
      <>
        <Typography variant="h1">{t('onboarding.aboutTitle')}</Typography>
        <TextField
          label={t('onboarding.nickname')}
          helperText={t('onboarding.nicknameHelp')}
          value={draft.nickname}
          onChange={(e) => set({ nickname: e.target.value })}
          slotProps={{ htmlInput: { maxLength: 20, id: 'nickname', autoComplete: 'off' } }}
        />
        {field('age', t('onboarding.age'), 'numeric')}
        <Typography sx={{ fontWeight: 700 }}>
          {t('onboarding.sex')} <Typography component="span" variant="body2" color="text.secondary">{t('onboarding.sexWhy')}</Typography>
        </Typography>
        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <Choice center title={t('onboarding.girl')} selected={draft.sex === 'f'} onClick={() => set({ sex: 'f' })} data-sex="f" />
          <Choice center title={t('onboarding.boy')} selected={draft.sex === 'm'} onClick={() => set({ sex: 'm' })} data-sex="m" />
          <Choice center title={t('onboarding.noAnswer')} selected={draft.sex === 'x'} onClick={() => set({ sex: 'x' })} data-sex="x" />
        </Box>
      </>
    );
  }
  if (step === 2) {
    body = (
      <>
        <Typography variant="h1">{t('onboarding.bodyTitle')}</Typography>
        <Typography color="text.secondary">{t('onboarding.bodyNote')}</Typography>
        {field('heightCm', t('onboarding.height'), 'numeric')}
        {field('weightKg', t('onboarding.weight'), 'decimal')}
      </>
    );
  }
  if (step === 3) body = <GoalStep draft={draft} set={set} />;
  if (step === 4) {
    body = (
      <>
        <Typography variant="h1">{t('onboarding.levelTitle')}</Typography>
        <Box sx={{ display: 'grid', gap: 1 }}>
          {Object.keys(LEVELS).map((id) => (
            <Choice key={id} title={t(`level.${id}.label`)} text={t(`level.${id}.text`)} selected={Number(draft.level) === Number(id)} onClick={() => set({ level: id })} data-level={id} />
          ))}
        </Box>
        <Typography sx={{ fontWeight: 700 }}>{t('onboarding.daysTitle')}</Typography>
        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' }}>
          {[2, 3, 4, 5, 6].map((d) => (
            <Choice key={d} center title={d} selected={Number(draft.daysPerWeek) === d} onClick={() => set({ daysPerWeek: d })} data-days={d} />
          ))}
        </Box>
      </>
    );
  }
  if (step === LAST_STEP) {
    const profile = toProfile(draft);
    const plan = buildPlan(profile, today());
    body = (
      <>
        <BearStage sx={{ width: 130, mx: 'auto' }}><Bear /></BearStage>
        <Typography variant="h1" sx={{ textAlign: 'center', overflowWrap: 'anywhere' }}>{t('onboarding.planReady', { name: profile.nickname })}</Typography>
        <PrognosisCard plan={plan} profile={profile} />
        {plan.assessment.category === 'under' && (
          <Section tone="alert"><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{t('onboarding.underweight')} {t('support')}</Typography></Section>
        )}
        <Section title={t('week.title')}><WeekList plan={plan} /></Section>
      </>
    );
  }

  let label = t('common.next');
  if (step === 0) label = t('onboarding.start');
  if (step === LAST_STEP) label = t('onboarding.go');

  return (
    <Box sx={{
      maxWidth: 560, mx: 'auto', minHeight: '100dvh', display: 'flex', flexDirection: 'column', gap: 1.5,
      pt: 'calc(env(safe-area-inset-top) + 16px)',
      pb: 'calc(env(safe-area-inset-bottom) + 16px)',
      pl: 'max(16px, env(safe-area-inset-left))',
      pr: 'max(16px, env(safe-area-inset-right))',
    }}
    >
      <LinearProgress
        variant="determinate"
        color="secondary"
        value={((step + 1) / (LAST_STEP + 1)) * 100}
        aria-label={t('onboarding.step', { step: step + 1, total: LAST_STEP + 1 })}
        sx={{ height: 10, borderRadius: 5, flex: 'none' }}
      />
      {body}
      {error && <Typography color="error" role="alert" sx={{ fontWeight: 700 }}>{error}</Typography>}
      <Box sx={{ mt: 'auto', pt: 1, display: 'grid', gap: 1.25 }}>
        <Button variant="contained" disabled={Boolean(blocked)} onClick={next} data-next>{label}</Button>
        {step > (editing ? 1 : 0) && <Button variant="outlined" onClick={() => setStep(step - 1)} data-back>{t('common.back')}</Button>}
        {editing && <Button variant="text" onClick={() => setEditing(false)} data-cancel>{t('common.cancel')}</Button>}
      </Box>
    </Box>
  );
}
