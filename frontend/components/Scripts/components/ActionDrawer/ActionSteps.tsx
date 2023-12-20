import React, { useEffect, useState } from 'react';
import {
  Box,
  Step,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  useSteps,
  useToast,
} from '@chakra-ui/react';
import SelectAction from './SelectAction';
import Configuration from './Configuration';
import ScheduleAction from './ScheduleAction';
import {
  getGoogleSpreadsheets,
  saveDatamartAction,
  updateDatamartAction,
} from '@lib/services/datamartActionService';
import {
  ActionMeta,
  ActionType,
  DatamartAction,
  Schedule,
} from '@lib/domain/datamartActions';
import { isValidMeta, isValidSchedule } from '@components/Scripts/util';
import { useRouter } from 'next/router';

type ActionStepsProps = {
  datamartId: string;
  workbookName: string;
  action?: DatamartAction;
  setAction: React.Dispatch<React.SetStateAction<DatamartAction | undefined>>;
  triggerSave: boolean;
  setTriggerSave: React.Dispatch<React.SetStateAction<boolean>>;
  setIsActionBeingCreated: React.Dispatch<React.SetStateAction<boolean>>;
  setIsCreateActionDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  onClose: () => void;
  setDatartActions: React.Dispatch<React.SetStateAction<DatamartAction[]>>;
  isAuthenticated?: boolean;
};

const ActionSteps = ({
  datamartId,
  action,
  setAction,
  workbookName,
  triggerSave,
  setTriggerSave,
  setIsCreateActionDisabled,
  onClose,
  setDatartActions,
  setIsActionBeingCreated,
  isAuthenticated,
}: ActionStepsProps) => {
  const steps = [
    { title: 'Action' },
    { title: 'Configuration' },
    { title: 'Frequency' },
  ];
  const router = useRouter();
  const { showActionDrawer } = router.query;

  const { activeStep, setActiveStep } = useSteps({
    index: showActionDrawer ? 1 : 0,
    count: steps.length,
  });

  const [selectedAction, setSelectedAction] = useState<ActionType | undefined>(
    showActionDrawer ? ActionType.GOOGLE_SHEET : action?.type
  );
  const [meta, setMeta] = useState<ActionMeta | {}>(action?.meta || {});
  const [schedule, setSchedule] = useState<Schedule | {}>(
    action?.schedule || {}
  );

  const toast = useToast();

  useEffect(() => {
    // check if meta entered is valid, then proceed to setting frequency
    if (isValidMeta(meta)) {
      setActiveStep(2);
    }
  }, [meta]);

  useEffect(() => {
    if (
      selectedAction &&
      isValidMeta(meta) &&
      isValidSchedule(schedule as Schedule)
    ) {
      setIsCreateActionDisabled(false);
      setActiveStep(3);
    } else {
      setIsCreateActionDisabled(true);
    }
  }, [selectedAction, meta, schedule]);

  useEffect(() => {
    // save action when clicked on confirm
    if (!triggerSave) return;

    const handleSaveOrUpdate = async () => {
      const res = action
        ? await updateDatamartAction(
            action._id,
            datamartId,
            selectedAction!!,
            meta as ActionMeta,
            schedule as Schedule
          )
        : await saveDatamartAction(
            datamartId,
            selectedAction!!,
            meta as ActionMeta,
            schedule as Schedule
          );
      if (res.status === 200) {
        setTriggerSave(false);
        setIsActionBeingCreated(false);
        if (action)
          setDatartActions((prevActions) => {
            return prevActions.map((action) =>
              action._id === res?.data?._id ? res?.data : action
            );
          });
        else setDatartActions((prevActions) => [...prevActions, res?.data]);
      } else {
        toast({
          title: 'Something went wrong. Try again!',
          status: 'error',
          variant: 'subtle',
          isClosable: true,
        });
      }
      onClose();
      setIsCreateActionDisabled(true);
      setAction(undefined);
    };
    handleSaveOrUpdate();
  }, [triggerSave]);

  return (
    <Box overflow={'auto'} h={'full'}>
      <Stepper
        index={activeStep}
        orientation="vertical"
        colorScheme="radioBlack"
        gap="0"
      >
        {steps.map((step, index) => (
          <Step key={index}>
            <StepIndicator>
              <StepStatus
                complete={<StepNumber />}
                incomplete={<StepNumber />}
                active={<StepNumber />}
              />
            </StepIndicator>
            <Box>
              <StepTitle>
                <Text
                  mt={'1'}
                  fontSize={'sh-20'}
                  lineHeight={'sh-20'}
                  fontWeight={'600'}
                >
                  {step.title}
                </Text>
              </StepTitle>
              <Box mb={'11'}>
                {index === 0 ? (
                  <SelectAction
                    selectedAction={selectedAction}
                    setSelectedAction={setSelectedAction}
                    setActiveStep={setActiveStep}
                    setMeta={setMeta}
                    workbookName={workbookName}
                  />
                ) : index === 1 && activeStep >= 1 ? (
                  <Configuration
                    selectedAction={selectedAction}
                    meta={meta}
                    setMeta={setMeta}
                    isAuthenticated={isAuthenticated}
                    datamartId={datamartId}
                    workbookName={workbookName}
                  />
                ) : (
                  index === 2 &&
                  activeStep >= 2 && (
                    <ScheduleAction
                      schedule={schedule}
                      setSchedule={setSchedule}
                    />
                  )
                )}
              </Box>
            </Box>

            <StepSeparator />
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default ActionSteps;
