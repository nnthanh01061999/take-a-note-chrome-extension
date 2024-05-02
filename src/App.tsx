import FormCombobox from '@/components/control/combobox/FormCombobox';
import FormInput from '@/components/control/input/FormInput';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { TextArea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';
import { CHROME_DATA, CHROME_TEMPLATE, taskType } from './constants/index';
import FormTextArea from '@/components/textarea/FormTextArea';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { copyTextToClipboard } from '@/util';

const schema = z.object({
    data: z.array(
        z.object({
            name: z.string(),
            code: z.string(),
            page: z.string(),
            type: z.string(),
        })
    ),
    template: z.string(),
});

export type FormFields = z.infer<typeof schema>;

function App() {
    const [report, setReport] = useState<string>();
    const form = useForm<FormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            data: [],
            template: '',
        },
    });

    const { control, handleSubmit, reset, setValue, getValues } = form;

    const { fields, remove } = useFieldArray<FormFields>({
        name: 'data',
        control,
    });

    const loadLocalStorage = useCallback(() => {
        if (!chrome.tabs) return;
        chrome.tabs.query(
            {
                active: true,
                currentWindow: true,
            },
            () => {
                chrome.storage.local
                    .get([CHROME_DATA, CHROME_TEMPLATE])
                    .then((result) => {
                        const data = result?.[CHROME_DATA] || '';
                        const template = result?.[CHROME_TEMPLATE] || '';
                        const parseData = data ? JSON.parse(data) : [];
                        reset({
                            data: parseData,
                            template,
                        });
                    });
            }
        );
    }, [reset]);

    const onSave = useCallback(() => {
        const data = getValues('data');
        const template = getValues('template');
        chrome.storage.local.set({
            [CHROME_DATA]: JSON.stringify(data),
            [CHROME_TEMPLATE]: template,
        });
    }, [getValues]);

    const onClear = useCallback(() => {
        const clear = window.confirm('Do you want to clear?');
        if (!clear) return;
        chrome.storage.local
            .remove(CHROME_DATA)
            .then(() => reset({ data: [], template: getValues('template') }));
    }, [getValues, reset]);

    const onSort = useCallback(() => {
        const values = getValues('data');
        const sortValues = values?.sort((a, b) => a.code.localeCompare(b.code));
        setValue('data', sortValues);
        onSave();
    }, [getValues, onSave, setValue]);

    const onGroup = useCallback(() => {
        const values = getValues('data');
        const sortValues = values?.sort((a, b) => b.type.localeCompare(a.type));
        setValue('data', sortValues);
        onSave();
    }, [getValues, onSave, setValue]);

    const onRemove = useCallback(
        (index: number) => () => {
            remove(index);
            onSave();
        },
        [onSave, remove]
    );

    const onExport = (values: FormFields) => {
        const data = values.data?.map((item, index) => {
            return `${index + 1}. ${values.template
                ?.replace(
                    '{type}',
                    taskType?.[item.type as keyof typeof taskType]
                )
                ?.replace(`{code}`, item.code)
                ?.replace('{page}', item.page?.toLocaleLowerCase())
                ?.replace('{name}', item.name)}`;
        });
        setReport(data?.join('\n'));
    };

    useEffect(() => {
        loadLocalStorage();
    }, [loadLocalStorage]);

    return (
        <Form {...form}>
            <div className='p-2 w-[632px] h-[584px]'>
                <div className='grid gap-2'>
                    <div className='flex space-x-2'>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button>Clear</Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-fit'>
                                <div className='grid gap-2 grid-flow-col justify-start'>
                                    <Button onClick={onClear}>Clear</Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button onClick={onSort}>Sort</Button>
                        <Button onClick={onGroup}>Group</Button>
                        <Button onClick={onSave}>Save</Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button>Export</Button>
                            </PopoverTrigger>
                            <PopoverContent className='w-[632px] h-[584px]'>
                                <div className='grid gap-2'>
                                    <div className='grid gap-2 grid-flow-col justify-start'>
                                        <Button
                                            onClick={handleSubmit(onExport)}
                                        >
                                            Export
                                        </Button>
                                        <Button
                                            onClick={() =>
                                                copyTextToClipboard('report')
                                            }
                                        >
                                            Copy
                                        </Button>
                                    </div>
                                    <TextArea
                                        id='report'
                                        className='h-[440px]'
                                        value={report}
                                    />
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <FormInput name='template' />
                    <div className='grid gap-2'>
                        {fields?.map((item, index) => (
                            <div key={item.id} className='relative grid gap-2 '>
                                <Button
                                    className='absolute top-2 right-2'
                                    variant='link'
                                    onClick={onRemove(index)}
                                >
                                    <Trash />
                                </Button>
                                <div
                                    key={item.id}
                                    className='grid grid-cols-[140px,140px,140px] gap-1'
                                >
                                    <FormInput name={`data.${index}.code`} />
                                    <FormCombobox
                                        name={`data.${index}.type`}
                                        childProps={{
                                            mode: 'single',
                                            valueMode: 'string',
                                            options: [
                                                {
                                                    label: 'Feature',
                                                    value: 'feature',
                                                },
                                                {
                                                    label: 'Bug',
                                                    value: 'bug',
                                                },
                                                {
                                                    label: 'Enhance',
                                                    value: 'enhance',
                                                },
                                            ],
                                        }}
                                    />
                                    <FormInput name={`data.${index}.page`} />
                                </div>
                                <div className='grid gap-1'>
                                    <FormTextArea name={`data.${index}.name`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Form>
    );
}

export default App;
