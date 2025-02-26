import { useForm } from 'react-hook-form';
import { BaseTextInput, InputError } from 'src/baseComponent';
import Button from 'src/components/Buttons';
import { setContacts } from 'src/stores/extensions';
import { convertContacts } from 'src/utils';
import { toast } from 'react-toastify';
import { DivFlex } from 'src/components';
import Toast from 'src/components/Toast/Toast';
import { getLocalContacts, setLocalContacts } from 'src/utils/storage';
import { useState } from 'react';
import images from 'src/images';
import { PageConfirm, ItemWrapper } from './style';

type Props = {
  onClose: any;
  contact: any;
  networkId: any;
};

const AddContact = (props: Props) => {
  const { onClose, contact, networkId } = props;
  const [isValue, setIsValue] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    clearErrors,
    setValue,
  } = useForm();
  const addContact = () => {
    const aliasName = getValues('alias');
    const newContact = {
      aliasName,
      accountName: contact.accountName,
      chainId: contact.chainId,
      pred: contact.pred,
      keys: contact.keys,
    };
    getLocalContacts(
      networkId,
      (data) => {
        const contacts = data;
        contacts[0] = contacts[0] || {};
        contacts[0][`${contact.accountName}`] = newContact;
        setLocalContacts(networkId, contacts);
        setContacts(convertContacts(contacts));
        onClose(aliasName);
        toast.success(<Toast type="success" content="Add contact successfully" />);
      },
      () => {
        const contacts = {};
        contacts[0] = {};
        contacts[0][`${contact.accountName}`] = newContact;
        setLocalContacts(networkId, contacts);
        setContacts(convertContacts(contacts));
        onClose(aliasName);
        toast.success(<Toast type="success" content="Add contact successfully" />);
      },
    );
  };
  const copyToClipboard = (value) => {
    navigator.clipboard.writeText(value);
    toast.success(<Toast type="success" content="Copied!" />);
  };
  return (
    <PageConfirm>
      <div style={{ padding: 24 }}>
        <form onSubmit={handleSubmit(addContact)} id="contact-form">
          <ItemWrapper>
            <BaseTextInput
              inputProps={{
                maxLength: '1000',
                placeholder: 'e.g David',
                ...register('alias', {
                  required: {
                    value: true,
                    message: 'This field is required.',
                  },
                  maxLength: {
                    value: 256,
                    message: 'Enter an alias should be maximum 256 characters.',
                  },
                  validate: {
                    required: (val) => val.trim().length > 0 || 'Invalid data',
                  },
                }),
              }}
              title="Enter An Alias"
              height="auto"
              onChange={(e) => {
                clearErrors('alias');
                setIsValue(e.target.value);
                setValue('alias', e.target.value);
              }}
            />
          </ItemWrapper>
          {errors.alias && <InputError>{errors.alias.message}</InputError>}
          <ItemWrapper>
            <BaseTextInput
              inputProps={{ readOnly: true, value: contact.accountName }}
              title="Account Name"
              height="auto"
              image={{
                width: '12px',
                height: '12px',
                src: images.wallet.copyGray,
                callback: () => copyToClipboard(contact.accountName),
              }}
            />
          </ItemWrapper>
        </form>
      </div>
      <DivFlex justifyContent="space-between" padding="24px">
        <Button size="full" label="Cancel" variant="disabled" onClick={() => onClose(false)} />
        <Button size="full" label="Save" variant="primary" disabled={!isValue} form="contact-form" />
      </DivFlex>
    </PageConfirm>
  );
};

export default AddContact;
