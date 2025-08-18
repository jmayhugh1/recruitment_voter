import { useContext } from 'react';
import { SelectedNameContext } from '../context/selectedName-context';

export default function useSelectedName() {
  const ctx = useContext(SelectedNameContext);
  if (!ctx) {
    throw new Error('useSelectedName must be used inside SelectedNameProvider');
  }
  return ctx;
}
