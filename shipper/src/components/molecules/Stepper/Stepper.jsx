export default function Stepper({ steps = [], currentStep = 0 }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {steps.map((step, index) => (
        <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', background: index <= currentStep ? '#0f172a' : '#e2e8f0', color: index <= currentStep ? '#fff' : '#64748b', fontSize: 12 }}>
            {index + 1}
          </div>
          <span>{step}</span>
        </div>
      ))}
    </div>
  );
}
