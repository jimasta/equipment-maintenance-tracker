import { FormEvent, useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { ApiError, Ativo, AtivoInput } from '../../lib/api';
import styles from './AtivoForm.module.css';

const TIPOS = [
  { value: 'Bomba', label: 'Bomba' },
  { value: 'Gerador', label: 'Gerador' },
  { value: 'Veículo', label: 'Veículo' },
  { value: 'Maquinário', label: 'Maquinário' },
  { value: 'Outro', label: 'Outro' },
];

interface AtivoFormProps {
  ativo?: Ativo;
  onSubmit: (data: AtivoInput) => Promise<void>;
  onCancel: () => void;
}

export function AtivoForm({ ativo, onSubmit, onCancel }: AtivoFormProps) {
  const [nome, setNome] = useState(ativo?.nome ?? '');
  const [tipo, setTipo] = useState(ativo?.tipo ?? '');
  const [localizacao, setLocalizacao] = useState(ativo?.localizacao ?? '');
  const [dataAquisicao, setDataAquisicao] = useState(
    ativo?.dataAquisicao ? ativo.dataAquisicao.slice(0, 10) : '',
  );

  const [errors, setErrors] = useState<Partial<Record<keyof AtivoInput, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const nextErrors: typeof errors = {};
    if (!nome.trim()) nextErrors.nome = 'Informe o nome do ativo';
    if (!tipo) nextErrors.tipo = 'Selecione o tipo';
    if (!localizacao.trim()) nextErrors.localizacao = 'Informe a localização';
    if (!dataAquisicao) nextErrors.dataAquisicao = 'Informe a data de aquisição';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({ nome: nome.trim(), tipo, localizacao: localizacao.trim(), dataAquisicao });
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

      <Input
        label="Nome do ativo"
        placeholder="Ex: Bomba centrífuga 03"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        error={errors.nome}
        disabled={submitting}
      />

      <Select
        label="Tipo"
        placeholder="Selecione o tipo"
        options={TIPOS}
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        error={errors.tipo}
        disabled={submitting}
      />

      <Input
        label="Localização"
        placeholder="Ex: Galpão 2 - Setor B"
        value={localizacao}
        onChange={(e) => setLocalizacao(e.target.value)}
        error={errors.localizacao}
        disabled={submitting}
      />

      <Input
        label="Data de aquisição"
        type="date"
        value={dataAquisicao}
        onChange={(e) => setDataAquisicao(e.target.value)}
        error={errors.dataAquisicao}
        disabled={submitting}
      />

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando…' : ativo ? 'Salvar alterações' : 'Cadastrar ativo'}
        </Button>
      </div>
    </form>
  );
}
