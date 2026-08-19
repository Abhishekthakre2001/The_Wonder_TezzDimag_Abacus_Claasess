import React from 'react'
import Tabs from '../UI/Tabs';
import Sets from './Sets';
import Level from './Level';
import AppBar from '../UI/AppBar';
import Institute from './Institute';

export default function Masters() {
    return (
        <>
            <div className="max-w-7xl mx-auto">
                <AppBar
                    title="Masters Management"
                    subtitle="Configure and manage system-wide master data"
                />


                {/* Add Student Button - Responsive */}
                {/* <div className="flex justify-center md:justify-end mt-6">
                    <Button icon={Users} variant="primary" onClick={() => window.location.href = "/add-student"}>Add Student</Button>
                </div> */}
            </div>


            {/* tabs */}
            <div className="p-6">
                <Tabs
                    tabs={[
                        { label: 'Level', content: <Level /> },
                        { label: 'Sets', content: <Sets /> },
                        { label: 'Institute', content: <Institute /> }
                    ]}
                />
            </div>

        </>
    )
}
