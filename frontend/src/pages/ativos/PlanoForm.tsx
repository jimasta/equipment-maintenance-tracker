import { FormEvent, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { ApiError, IntervaloTipo, PlanoInput } from '../../lib/api';
import styles from './PlanoForm.module.css';

const TIPOS_INTERVALO = [
  { value: 'DIAS', label: 'Dias' },
  { value: 'HORAS_USO', label: 'Horas de uso' },
];

export function PlanoForm({
  ativoId,
  onSubmit,
  onCancel,
}: {
  ativoId: string;
  onSubmit: (data: PlanoInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [intervaloTipo, setIntervaloTipo] = useState<IntervaloTipo | ''>('');
  const [intervaloValor, setIntervaloValor] = useState('');
  const [errors, setErrors] = useState<{ intervaloTipo?: string; intervaloValor?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: typeof errors = {};
    if (!intervaloTipo) nextErrors.intervaloTipo = 'Selecione o tipo de intervalo';
    const valorNumerico = Number(intervaloValor);
    if (!intervaloValor || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      nextErrors.intervaloValor = 'Informe um valor maior que zero';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ativoId,
        intervaloTipo: intervaloTipo as IntervaloTipo,
        intervaloValor: valorNumerico,
      });
    } catch (err) {
      setFormError(
        err instanceof ApiError ? err.message : 'Não foi possível salvar. Tente novamente.',
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      {formError && (
        <div className={styles.formError} role="alert">
          {formError}
        </div>
      )}

      <div className={styles.row}>
        <Select
          label="Intervalo"
          placeholder="Selecione"
          options={TIPOS_INTERVALO}
          value={intervaloTipo}
          onChange={(e) => setIntervaloTipo(e.target.value as IntervaloTipo)}
          error={errors.intervaloTipo}
          disabled={submitting}
        />
        <Input
          label={intervaloTipo === 'HORAS_USO' ? 'Horas' : 'Dias'}
          type="number"
          min={1}
          placeholder="Ex: 90"
          value={intervaloValor}
          onChange={(e) => setIntervaloValor(e.target.value)}
          error={errors.intervaloValor}
          disabled={submitting}
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Adicionar plano'}
        </Button>
      </div>
    </form>
  );
}
