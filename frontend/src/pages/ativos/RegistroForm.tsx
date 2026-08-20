import { FormEvent, useId, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { ApiError, RegistroInput } from '../../lib/api';
import styles from './RegistroForm.module.css';

const HOJE = new Date().toISOString().slice(0, 10);

export function RegistroForm({
  planoManutencaoId,
  onSubmit,
  onCancel,
}: {
  planoManutencaoId: string;
  onSubmit: (data: RegistroInput) => Promise<void>;
  onCancel: () => void;
}) {
  const observacoesId = useId();
  const [dataExecucao, setDataExecucao] = useState(HOJE);
  const [custo, setCusto] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [errors, setErrors] = useState<{ dataExecucao?: string; custo?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: typeof errors = {};
    if (!dataExecucao) nextErrors.dataExecucao = 'Informe a data de execução';
    const custoNumerico = Number(custo);
    if (custo === '' || Number.isNaN(custoNumerico) || custoNumerico < 0) {
      nextErrors.custo = 'Informe um custo válido (pode ser 0)';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({
        planoManutencaoId,
        dataExecucao,
        custo: custoNumerico,
        observacoes: observacoes.trim() || undefined,
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
        <Input
          label="Data de execução"
          type="date"
          value={dataExecucao}
          onChange={(e) => setDataExecucao(e.target.value)}
          error={errors.dataExecucao}
          disabled={submitting}
        />
        <Input
          label="Custo (R$)"
          type="number"
          min={0}
          step="0.01"
          placeholder="Ex: 150.00"
          value={custo}
          onChange={(e) => setCusto(e.target.value)}
          error={errors.custo}
          disabled={submitting}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor={observacoesId}>
          Observações (opcional)
        </label>
        <textarea
          id={observacoesId}
          className={styles.textarea}
          placeholder="Ex: Troca de óleo e filtro, sem anomalias"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Registrando…' : 'Registrar execução'}
        </Button>
      </div>
    </form>
  );
}
