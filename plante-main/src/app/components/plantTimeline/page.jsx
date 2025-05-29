'use client'
import React from 'react'
import { format } from 'date-fns'
import { Smile, Meh, Frown, Trash2 } from 'lucide-react'
import { useState } from 'react'

export default function plantTimeline({ plantId, entries }) {
    const { deleteGrowthEntry } = usePlants()
    const { entryToDelete, setEntryToDelete } = useState(null)

    const getMoodIcon = (mood) => {
        switch (mood) {
            case 'happy':
                return <Smile className="w-6 h-6 text-green-500" />
            case 'neutral':
                return <Meh className="w-6 h-6 text-yellow-500" />
            case 'sad':
                return <Frown className="w-6 h-6 text-red-500" />
            default:
                return null
        }
    }

    const handleDelete = () => {
        if (entryToDelete) {
            deleteGrowthEntry(plantId, entryToDelete)
            setEntryToDelete(null)
        }
    }

    if (entries.length === 0) {
        return(
            <div className="flex justify-center items-center h-full">
                <p className="text-gray-500">ยังไม่มีข้อมูลการเจริญเติบโต</p>
            </div>
        )
    }

    return(
        <div className='relative'>
            <div className='timeline-line'/>

            <div className='space-y-10'>
                {entries.map((entry, index) => {
                    const isEven = index % 2 === 0
                    return(
                        <div 
                            key={entry.id} 
                            className={`relative ${isEven ? 'ml-auto pr-8' : 'mr-auto pl-8'} w-full md:w-[calc(50%-1rem)]`}
                        >
                            <div className='timeline-dot' style={{top: '1.5rem'}} />
                            <div className={`plant-card ${isEven ? 'mr-4' : 'ml-4'}`}>
                                <div className='flex justify-between items-center mb-2'>
                                    <div className='text-sm font-medium text-plant-brown'>
                                        {format(entry.date, 'dd/MM/yyyy')}
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        {getMoodIcon(entry.mood)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1 mb-1">
                                <span className="text-lg font-medium">{entry.height}</span>
                                <span className="text-xs text-plant-brown">cm</span>
                            </div>

                            {entry.notes && (
                            <p className="text-sm mt-2 text-plant-brown">{entry.notes}</p>
                            )}

                            <div className="flex justify-end mt-3">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                    <Button 
                                        variant="ghost" 
                                        size="sm"
                                        className="h-8 px-2 text-red-500 hover:bg-red-50"
                                        onClick={() => setEntryToDelete(entry.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>แน่ใจหรือไม่?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                        การลบเป็นแบบถาวร ไม่สามารถกู้คืนได้
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setEntryToDelete(null)}>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                        onClick={confirmDelete}
                                        className="bg-red-500 hover:bg-red-600"
                                        >
                                        ลบ
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
