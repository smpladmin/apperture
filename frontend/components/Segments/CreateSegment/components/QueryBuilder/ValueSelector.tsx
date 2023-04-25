import { ISFilterOperators } from '@components/Segments/util';
import {
  SegmentFilter,
  SegmentFilterDataType,
  SegmentFilterOperatorsString,
  WhereSegmentFilter,
} from '@lib/domain/segment';
import InputValue, { InputValueType } from './InputValue';
import SelectValue from './SelectValue';

type ValueSelectorProps = {
  filter: WhereSegmentFilter;
  filters: SegmentFilter[];
  updateGroupsState: Function;
  index: number;
};

const ValueSelector = ({
  filter,
  filters,
  index,
  updateGroupsState,
}: ValueSelectorProps) => {
  return (
    <>
      {[SegmentFilterDataType.STRING].includes(filter.datatype) ? (
        ISFilterOperators.includes(
          filter.operator as SegmentFilterOperatorsString
        ) ? (
          <SelectValue
            filter={filter}
            filters={filters}
            updateGroupsState={updateGroupsState}
            index={index}
          />
        ) : (
          <InputValue
            index={index}
            filter={filter}
            filters={filters}
            updateGroupsState={updateGroupsState}
            type={InputValueType.TEXT}
          />
        )
      ) : null}
      {[SegmentFilterDataType.NUMBER].includes(filter.datatype) ? (
        <InputValue
          index={index}
          filter={filter}
          filters={filters}
          updateGroupsState={updateGroupsState}
          type={InputValueType.NUMBER}
        />
      ) : null}
    </>
  );
};

export default ValueSelector;
