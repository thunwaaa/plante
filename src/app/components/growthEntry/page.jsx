'use client'
import React, { useState } from 'react'
import { format } from 'date-fns'
import { Calendar1Icon, Smile, Meh, Frown } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
  } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { date, z } from 'zod'
import { Field } from '@headlessui/react'

const formSchema = z.object({
    date: z.string().min(1, { message: 'กรุณาเลือกวันที่' }),
    height: z.string().min(1, { message: 'กรุณากรอกความสูง' }).refine(val => !isNaN(Number(val)), {
        message: 'กรุณากรอกตัวเลขเท่านั้น',
    }),
    note: z.string().optional(),
    mood: z.enum(['happy', 'neutral', 'sad'])
})

export default function GrowthEntry({ onClose, plantId}) {
    const { addEntry } = usePlants()

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            height: '',
            note: '',
            mood: 'neutral'
        },
    })

    const onSubmit = (values) => {
        addEntry(plantId, {
            date: values.date,
            height: Number(values.height),
            note: values.note || '',
            mood: values.mood
        })
        onClose()
    }

    const handleMoodClick = (mood) => {
        form.setValue('mood', mood)
    }

    return (
        <div>
            <h2>บันทึกการเติบโตต้นไม้</h2>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
                    <FormField
                        control = {form.control}
                        name = 'date'
                        render = {({field}) => (
                            <FormItem className='flex flex-col'>
                                <FormLabel>วันที่</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                "pl-3 text-left font-normal border-plant-beige bg-white/70",
                                                !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                format(field.value, "dd/MM/yyyy")
                                                ) : (
                                                <span>เลือกวันที่</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar 
                                            mode='single' 
                                            selected={field.value} 
                                            onSelect={field.onChange}
                                            initialFocus
                                            className={cn("p-3 pointer-events-auto")}
                                            />
                                    </PopoverContent>
                                </Popover>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name='height'
                        render={({field}) => (
                            <FormItem className={'flex flex-col'}>
                                <FormLabel>ความสูง (cm)</FormLabel>
                                <FormControl>
                                    <Input 
                                        type='number' 
                                        step = '0.1'
                                        placeholder='กรอกความสูง' 
                                        className='border-plant-beige rounded-2xl p-4 w-64 font-bold'
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>บันทึกเพิ่มเติม</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Optional notes about your plant's condition"
                                className="border-plant-beige bg-white/70"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mood"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Plant Mood</FormLabel>
                            <div className="flex justify-center gap-6 mt-2">
                            <Button 
                                type="button"
                                variant="ghost" 
                                className={cn(
                                "flex flex-col items-center",
                                field.value === 'happy' && "bg-green-100"
                                )}
                                onClick={() => handleMoodClick('happy')}
                            >
                                <Smile className="h-6 w-6 text-green-500" />
                                <span className="text-xs mt-1">Happy</span>
                            </Button>

                            <Button 
                                type="button"
                                variant="ghost" 
                                className={cn(
                                "flex flex-col items-center",
                                field.value === 'neutral' && "bg-yellow-100"
                                )}
                                onClick={() => handleMoodClick('neutral')}
                            >
                                <Meh className="h-6 w-6 text-yellow-500" />
                                <span className="text-xs mt-1">Neutral</span>
                            </Button>

                            <Button 
                                type="button"
                                variant="ghost" 
                                className={cn(
                                "flex flex-col items-center", 
                                field.value === 'sad' && "bg-red-100"
                                )}
                                onClick={() => handleMoodClick('sad')}
                            >
                                <Frown className="h-6 w-6 text-red-500" />
                                <span className="text-xs mt-1">Sad</span>
                            </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <div className="flex justify-end gap-2 mt-6">
                        <Button type="button" variant="outline" onClick={onClose} className="border-plant-beige">
                        ยกเลิก
                        </Button>
                        <Button type="submit" className="bg-plant-medium-green hover:bg-plant-dark-green text-white">
                        เพิ่มบันทึก
                        </Button>
                    </div>
                </form>
            </Form>
        </div>

    )
}
