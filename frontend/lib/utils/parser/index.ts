import peg from 'pegjs';
import {
  DimensionGrammar,
  FormulaExtratorGrammar,
  MetricGrammar,
} from './grammar';

export const Metricparser = (properties?: string[]) =>
  peg.generate(MetricGrammar(properties, ['Login', 'Logout']));

export const DimensionParser = (properties?: string[]) =>
  peg.generate(DimensionGrammar(properties));

export const FormulaParser = peg.generate(FormulaExtratorGrammar);
