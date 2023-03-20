import React, {
  useEffect,
  useMemo,
  useState,
  useRef,
  createContext,
  useContext,
} from 'react';
import { useParams } from 'react-router';
import axios from 'axios';
import './FormBuilder.css';
import { Image, Layout, Card, Button, message } from 'antd';
import { BetaSchemaForm } from '@ant-design/pro-form/lib';
import bg from '../public/img/bg1.jpg';
import { getQueryString } from './utils';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';

interface FormContextProps {
  formData: any;
  setFormData: React.Dispatch<any>;
  loading: boolean;
  setLoading: React.Dispatch<boolean>;
  mergeCount: boolean[];
  setMergeCount: React.Dispatch<boolean[]>;
}

export const FormContext = createContext({} as FormContextProps);

const FormBuilder = (props: any) => {
  const formId = getQueryString('formId');
  const optCode = getQueryString('optCode');
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [banner, setBanner] = useState('');
  const [collections, setCollections] = useState<any[]>([]);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [mergeCount, setMergeCount] = useState<boolean[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!_.isEmpty(formId)) {
      fetchFormJSONData(formId);
    }
  }, [formId]);

  useEffect(() => {
    let count = 0;
    _.forEach(mergeCount, (bol) => {
      if (bol) ++count;
    });
    if (loading && count === collections.length) {
      submit();
    }
  }, [mergeCount, formData, loading]);

  const fetchFormJSONData = async (formId: string | null) => {
    axios.get(`/api/v1/formBuilder/byId/${formId}`).then((res) => {
      if (res.status === 200) {
        const data = res?.data?.data;
        const { metaJSON, formJSON } = JSON.parse(data?.content);
        const { title, subTitle } = metaJSON;
        setTitle(title);
        setSubTitle(subTitle);
        setBanner(`/img/${metaJSON.banner}`);
        setCollections(formJSON);
      }
    });
  };

  const mergeData = () => {
    setFormData({});
    setMergeCount([]);
    if (loading) return;
    setLoading(true);
  };

  const submit = async () => {
    // if (loading) return;
    // setLoading(true);
    console.log('-> formData', formData);

    axios
      .post(`/api/v1/formBuilderDetail/add`, {
        formId,
        optCode,
        formData: JSON.stringify(formData),
      })
      .then((res) => {
        if (res.status === 200) {
          const data = res?.data?.data;
          console.log('-> data', data);
          message.success('提交成功！');
          setLoading(false);
          setMergeCount([]);
          navigate('/success');
        }
      })
      .catch((e: any) => {
        message.error(e?.response?.data?.message || e.toString());
        setLoading(false);
        setMergeCount([]);
      });
  };

  const value = {
    formData,
    setFormData,
    loading,
    setLoading,
    mergeCount,
    setMergeCount,
  };

  return (
    <FormContext.Provider value={value}>
      <div className='form-wrapper' style={{ height: '100%' }}>
        {/*<Image src={banner} preview={false} />*/}
        <h1 className='form-title'>{title}</h1>
        <h4 className='form-subTitle'>{subTitle}</h4>
        <Layout className='form-group' style={{ padding: '16px' }}>
          {collections.map((columns: any, index: number) => {
            return (
              <div key={`group${index}`}>
                <p className='group-title'>{`Group ${index + 1}`}</p>
                <Card className='form-card'>
                  <GroupItem columns={columns} index={index} />
                </Card>
              </div>
            );
          })}
          <Button
            type='primary'
            block
            className='form-submit-button'
            onClick={mergeData}>
            提交
          </Button>
        </Layout>
      </div>
    </FormContext.Provider>
  );
};

const GroupItem = (props: { columns: any[]; index: number }) => {
  const { columns, index } = props;
  const { setFormData, loading, setLoading, mergeCount, setMergeCount } =
    useContext(FormContext);
  const formRef = useRef<any>();

  useEffect(() => {
    if (loading) {
      const form = formRef.current;
      console.log('-> form', form);
      form
        .validateFieldsReturnFormatValue()
        .then((values: any) => {
          const data = values;
          // const newFormData = _.cloneDeep(formData);
          setFormData((pre: any) => ({
            ...pre,
            ...data,
          }));
          const _mergeCount = _.cloneDeep(mergeCount);
          _mergeCount[index] = true;
          //@ts-ignore
          setMergeCount((pre: any) => [...pre, ..._mergeCount]);
        })
        .catch((e: any) => {
          const _mergeCount = _.cloneDeep(mergeCount);
          _mergeCount[index] = false;
          //@ts-ignore
          setMergeCount((pre: any) => [...pre, ..._mergeCount]);
          setLoading(false);
        });
    }
  }, [loading]);

  return (
    <BetaSchemaForm
      formRef={formRef}
      submitter={false}
      layoutType='Form'
      columns={columns}
    />
  );
};

export default FormBuilder;
