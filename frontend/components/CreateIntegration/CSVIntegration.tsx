import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Provider } from '@lib/domain/provider';
import { BLACK } from '@theme/index';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import uploadIcon from '@assets/icons/CloudArrowUp.svg';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import {
  createIntegrationWithDataSource,
  createTableWithCSV,
  deleteCSV,
  uploadCSV,
} from '@lib/services/integrationService';
import { UploadProgress } from '@lib/domain/integration';
import { ClipboardText, X } from 'phosphor-react';

const CSVIntegration = () => {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileId, setUploadedFileId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadInitiated, setUploadInitiated] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleUpload = async () => {
    if (uploadedFile) {
      setUploadInitiated(true);
      const appId = router.query.appId as string;

      const fileObj = await uploadCSV(
        uploadedFile,
        appId,
        (progressUpdate: UploadProgress) => {
          setProgress(progressUpdate.progress);
          if (progressUpdate.isCompleted) {
            setUploadComplete(true);
          }
        }
      );
      setUploadedFileId(fileObj._id);
    }
  };

  const createIntegration = async () => {
    setIsLoading(true);
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;
    console.log('id', uploadedFileId);
    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      uploadedFileId
    );
    const statusCode = await createTableWithCSV(
      uploadedFileId,
      integration.datasource._id
    );
    setIsLoading(false);
    if (statusCode === 200) {
      router.replace({
        pathname: '/analytics/app/[appId]/integration/[provider]/complete',
        query: {
          appId: router.query.appId,
          provider: router.query.provider,
          dsId: integration.datasource._id,
        },
      });
    } else {
      toast({
        title: 'Error while loading data from CSV file',
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    }
  };

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFileUpload(acceptedFiles[0]);
      }
    },
    [handleUpload]
  );
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
  });

  const handleClearFile = async () => {
    setUploadedFile(null);
    setUploadInitiated(false);
    setUploadComplete(false);
    // await deleteCSV(uploadedFile?.name as string);
  };

  return (
    <Flex direction={'column'} alignItems={'center'} gap={48} margin={162}>
      <Text
        color={'grey.900'}
        fontSize={'sh-28'}
        lineHeight={'base'}
        fontWeight={700}
      >
        Connect data source
      </Text>

      {uploadInitiated ? (
        <Flex direction={'column'} gap={'28px'}>
          <Flex
            alignItems={'center'}
            p={'12px'}
            justifyContent={'space-between'}
            border="1px"
            borderColor={'grey.400'}
            borderRadius="12px"
            width={400}
            textAlign="center"
          >
            <Flex gap={'8px'} alignItems={'center'}>
              <Box
                borderRadius={'100px'}
                border={'1px'}
                borderColor={'white.200'}
                padding={'12px'}
                background={'white.500'}
                h={'40px'}
                w={'40px'}
              >
                <ClipboardText size={16} />
              </Box>
              <Flex direction={'column'} alignItems={'flex-start'} gap={'4px'}>
                <Text
                  color={'grey.900'}
                  fontSize={'xs-16'}
                  lineHeight={'xs-14'}
                  fontWeight={500}
                  textAlign={'left'}
                  maxW={75}
                >
                  {uploadedFile?.name}
                </Text>
                <Text
                  color={'grey.600'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={400}
                >
                  {progress + '%'}
                </Text>
              </Flex>
            </Flex>
            <Box cursor={'pointer'} onClick={handleClearFile}>
              <X size={16} />
            </Box>
          </Flex>
          <Button
            py={'2'}
            px={'4'}
            bg={'black.400'}
            variant={'primary'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            color={'white.DEFAULT'}
            onClick={createIntegration}
            disabled={!uploadComplete}
            isLoading={isLoading}
          >
            Create Sheet
          </Button>
        </Flex>
      ) : (
        <Flex
          border="1px"
          borderColor={'grey.400'}
          borderRadius="12px"
          width={400}
          textAlign="center"
          direction={'column'}
          gap={'24px'}
          alignItems={'center'}
          p={'40px'}
        >
          <Box
            cursor="pointer"
            transition="border 0.3s ease"
            {...getRootProps()}
            width={'100%'}
          >
            <Image
              width={'54px'}
              height={'54px'}
              src={uploadIcon}
              alt="uploadIcon"
            />
            <input {...getInputProps()} />
            {isDragActive ? (
              <Text color="teal.500">Drop the file here</Text>
            ) : (
              <Flex direction={'column'} gap={'8px'}>
                <Text
                  color={'grey.900'}
                  fontSize={'xs-16'}
                  lineHeight={'base'}
                  fontWeight={500}
                >
                  Upload a CSV file
                </Text>
                <Text
                  color={'grey.600'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-14'}
                  fontWeight={400}
                >
                  Drag and drop or select a file
                </Text>
                {uploadedFile ? (
                  <Flex alignItems={'center'} justifyContent={'center'}>
                    <Text
                      color={'grey.600'}
                      fontSize={'xs-12'}
                      lineHeight={'xs-14'}
                      fontWeight={400}
                    >
                      {uploadedFile.name}
                    </Text>
                    <IconButton
                      aria-label="Delete"
                      icon={<i className="ri-delete-bin-line" />}
                      h={'3'}
                      w={'3'}
                      color={'grey.600'}
                      bg={'transparent'}
                      _hover={{
                        backgroundColor: 'white.0',
                        color: 'grey.100',
                      }}
                      _active={{
                        backgroundColor: 'transparent',
                      }}
                      onClick={() => setUploadedFile(null)}
                    />
                  </Flex>
                ) : (
                  <></>
                )}
              </Flex>
            )}
          </Box>
          <Button
            px={'4'}
            py={'3'}
            borderRadius={'8px'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            bg={BLACK}
            color={'white.DEFAULT'}
            _hover={{
              bg: 'grey.200',
            }}
            onClick={uploadedFile ? handleUpload : open}
          >
            {uploadedFile ? 'Upload File' : 'Choose File'}
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default CSVIntegration;
