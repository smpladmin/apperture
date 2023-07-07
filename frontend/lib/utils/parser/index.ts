import peg from 'pegjs';
import {
  DimensionGrammar,
  FormulaExtratorGrammar,
  MetricGrammar,
} from './grammar';

export const Metricparser = (properties?: string[], values?: string[]) =>
  peg.generate(MetricGrammar(properties, values));

export const DimensionParser = (properties?: string[]) =>
  peg.generate(DimensionGrammar(properties));

export const FormulaParser = peg.generate(FormulaExtratorGrammar);
