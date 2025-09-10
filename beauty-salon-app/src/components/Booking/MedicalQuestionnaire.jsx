import { useState } from 'react';
import { theme, getCardStyle } from '../../utils/theme';

const MedicalQuestionnaire = ({ onComplete, initialData = {} }) => {
  const [formData, setFormData] = useState({
    pregnancy: initialData.pregnancy || '',
    nailBiting: initialData.nailBiting || '',
    allergies: initialData.allergies || '',
    cuticleRemoval: initialData.cuticleRemoval || '',
    fungalProblems: initialData.fungalProblems || '',
    medications: initialData.medications || '',
    physicalActivity: initialData.physicalActivity || '',
    poolBeach: initialData.poolBeach || '',
    diabetes: initialData.diabetes || '',
    ingrownNails: initialData.ingrownNails || '',
    nailCondition: initialData.nailCondition || '',
    nailConditionOther: initialData.nailConditionOther || ''
  });

  const handleChange = (field, value) => {
    const newData = {
      ...formData,
      [field]: value
    };
    setFormData(newData);
    onComplete(newData);
  };

  const RadioGroup = ({ label, name, value, onChange }) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        color: '#FFD700',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', gap: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
          <input
            type="radio"
            name={name}
            value="sim"
            checked={value === 'sim'}
            onChange={(e) => onChange(name, e.target.value)}
            style={{ marginRight: '8px', accentColor: '#FFD700' }}
          />
          Sim
        </label>
        <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
          <input
            type="radio"
            name={name}
            value="nao"
            checked={value === 'nao'}
            onChange={(e) => onChange(name, e.target.value)}
            style={{ marginRight: '8px', accentColor: '#FFD700' }}
          />
          Não
        </label>
      </div>
    </div>
  );

  const CheckboxGroup = ({ label, name, options, value, onChange, allowOther = false }) => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        color: '#FFD700',
        fontWeight: '500',
        fontSize: '0.9rem'
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
        {options.map(option => (
          <label key={option} style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={value.includes(option)}
              onChange={(e) => {
                const newValue = e.target.checked 
                  ? [...value, option]
                  : value.filter(v => v !== option);
                onChange(name, newValue);
              }}
              style={{ marginRight: '8px', accentColor: '#FFD700' }}
            />
            {option}
          </label>
        ))}
        {allowOther && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center', color: 'white', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={value.includes('outros')}
                onChange={(e) => {
                  const newValue = e.target.checked 
                    ? [...value.filter(v => v !== 'outros'), 'outros']
                    : value.filter(v => v !== 'outros');
                  onChange(name, newValue);
                }}
                style={{ marginRight: '8px', accentColor: '#FFD700' }}
              />
              Outros:
            </label>
            {value.includes('outros') && (
              <input
                type="text"
                value={formData.nailConditionOther}
                onChange={(e) => handleChange('nailConditionOther', e.target.value)}
                placeholder="Especifique..."
                style={{
                  padding: '4px 8px',
                  border: '1px solid rgba(255, 215, 0, 0.3)',
                  borderRadius: '4px',
                  background: 'rgba(0, 0, 0, 0.5)',
                  color: 'white',
                  fontSize: '0.8rem',
                  width: '150px'
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-card" style={{
      ...getCardStyle(true),
      marginBottom: '20px'
    }}>
      <div className="card-header">
        <span className="card-icon">📋</span>
        <h3 className="card-title">Questionário de Anamnese</h3>
      </div>

      <div style={{ padding: '10px 0' }}>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.8)', 
          fontSize: '0.9rem', 
          marginBottom: '20px',
          lineHeight: '1.4'
        }}>
          Para garantir a segurança e qualidade do serviço, precisamos conhecer algumas informações sobre sua saúde:
        </p>

        <RadioGroup
          label="Está em gestação?"
          name="pregnancy"
          value={formData.pregnancy}
          onChange={handleChange}
        />

        <RadioGroup
          label="Tem hábito de roer unhas?"
          name="nailBiting"
          value={formData.nailBiting}
          onChange={handleChange}
        />

        <RadioGroup
          label="Possui alergia a esmaltes ou cosméticos?"
          name="allergies"
          value={formData.allergies}
          onChange={handleChange}
        />

        <RadioGroup
          label="Costuma retirar a cutícula?"
          name="cuticleRemoval"
          value={formData.cuticleRemoval}
          onChange={handleChange}
        />

        <RadioGroup
          label="Tem problema com micose ou fungo?"
          name="fungalProblems"
          value={formData.fungalProblems}
          onChange={handleChange}
        />

        <RadioGroup
          label="Faz uso de algum medicamento?"
          name="medications"
          value={formData.medications}
          onChange={handleChange}
        />

        <RadioGroup
          label="Pratica atividade física?"
          name="physicalActivity"
          value={formData.physicalActivity}
          onChange={handleChange}
        />

        <RadioGroup
          label="Frequenta piscina ou praia?"
          name="poolBeach"
          value={formData.poolBeach}
          onChange={handleChange}
        />

        <RadioGroup
          label="Tem diabetes?"
          name="diabetes"
          value={formData.diabetes}
          onChange={handleChange}
        />

        <RadioGroup
          label="Possui unha encravada?"
          name="ingrownNails"
          value={formData.ingrownNails}
          onChange={handleChange}
        />

        <CheckboxGroup
          label="A lâmina ungueal apresenta:"
          name="nailCondition"
          options={['descamação', 'descolamento', 'manchas', 'estrias']}
          value={Array.isArray(formData.nailCondition) ? formData.nailCondition : []}
          onChange={(name, value) => handleChange('nailCondition', value)}
          allowOther={true}
        />

        <div style={{
          background: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.3)',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '20px'
        }}>
          <p style={{ 
            color: '#FFD700', 
            fontSize: '0.85rem', 
            margin: 0,
            lineHeight: '1.4'
          }}>
            ℹ️ <strong>Informação importante:</strong> Todas as informações fornecidas são confidenciais e serão utilizadas apenas para garantir a qualidade e segurança do procedimento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicalQuestionnaire;