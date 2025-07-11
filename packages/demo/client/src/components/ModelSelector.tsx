import React from 'react'

interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (model: string) => void
  disabled?: boolean
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  selectedModel, 
  onModelChange, 
  disabled 
}) => {
  const models = [
    { id: 'sonnet', name: 'Claude Sonnet', description: 'Fast & efficient' },
    { id: 'opus', name: 'Claude Opus', description: 'Most capable' }
  ]

  return (
    <div className="model-selector">
      <label htmlFor="model-select" className="model-label">Model:</label>
      <select
        id="model-select"
        className="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value)}
        disabled={disabled}
      >
        {models.map(model => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ModelSelector