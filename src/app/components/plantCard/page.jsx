'use client'
import React from 'react'
import { format } from 'date-fns'
import { Leaf, CalendarDays } from 'lucide-react'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from '@/components/ui/card'

  export default function PlantCard({ plant }) {
    const { setActivePlant, deletePlant } = usePlants()

    const latesHeight = plant.entries.lenght > 0 ? plant.entries[plant.entries.length - 1].height : 0
    const hasEntries = plant.entries.length > 0

    return(
        <Card className="plant-card overflow-hidden hover:shadow-lg transition-all">
            <CardHeader className='pb-2'>
                <CardTitle className='text-lg'>
                    {plant.name}
                </CardTitle>
                <div className='text-sm flex items-center gap-1'>
                    <Leaf className='w-4 h-4' />
                    <span>{plant.type}</span>
                </div>
            </CardHeader>
            <CardContent className='pb-4'>
                <div className='text-sm flex items-center gap-1'>
                    <CalendarDays className='w-4 h-4' />
                    <span>วันที่ปลูก: {format(plant.plantedDate, 'dd/MM/yyyy')}</span>
                </div>
                {hasEntries && (
                    <div className='mt-2 text-sm'>
                        ความสูงปัจจุบัน: <span className='font-medium'>{latesHeight} cm</span>
                    </div>
                )}
                <div className='mt-2 text-sm'>
                    จำนวนการบันทึก: <span className='font-medium'>{plant.entries.length} ครั้ง</span>
                </div>
            </CardContent>
            <CardFooter className='flex justify-between pt-0'>
                <button 
                    variant='outline' 
                    className='border-plant-beige hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-xs' 
                    onClick={() => deletePlant(plant.id)}
                >
                    ลบ
                </button>
                <button
                    variant='outline' 
                    className='border-plant-beige hover:bg-plant-medium-green hover:text-white hover:border-plant-medium-green text-xs' 
                    onClick={() => setActivePlant(plant.id)}
                >
                    ดูรายละเอียด
                </button>
            </CardFooter>
        </Card>
    )
  }