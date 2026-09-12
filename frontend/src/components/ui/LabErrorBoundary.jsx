import React from 'react';

export default class LabErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Quantum Lab Error Boundary caught an exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          backgroundColor: 'var(--bg-primary, #0b1120)',
          color: 'var(--text-primary, #f8fafc)',
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '650px',
            width: '100%',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ fontSize: '2rem' }}>⚛️</div>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.25rem', color: '#ef4444', fontFamily: 'monospace' }}>
                  QUANTUM LAB RENDERING RECOVERY
                </h2>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted, #94a3b8)', fontSize: '0.875rem' }}>
                  The Quantum Lab encountered an unexpected rendering error.
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '16px',
              margin: '20px 0',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#f87171',
              maxHeight: '180px',
              overflowY: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error?.toString()}
              {this.state.errorInfo?.componentStack}
            </div>

            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#06b6d4',
                  color: '#0b1120',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                  cursor: 'pointer'
                }}
              >
                ↻ RETRY QUANTUM LAB
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
