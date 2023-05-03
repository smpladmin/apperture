import { SegmentFilter } from '@lib/domain/segment';
import InputValue, { InputValueType } from './InputValue';
import SelectValue from './SelectValue';
import {
  FilterDataType,
  FilterOperatorsString,
  ISFilterOperators,
  WhereFilter,
} from '@lib/domain/common';

type ValueSelectorProps = {
  filter: WhereFilter;
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
      {[FilterDataType.STRING].includes(filter.datatype) ? (
        ISFilterOperators.includes(filter.operator as FilterOperatorsString) ? (
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
      {[FilterDataType.NUMBER].includes(filter.datatype) ? (
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
