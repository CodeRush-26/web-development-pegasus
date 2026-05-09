import { Bell, Check, Trash } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sample notifications data
const notifications = [
  {
    id: 1,
    title: 'Welcome to the platform',
    message: 'Thank you for joining our platform. We hope you enjoy your experience.',
    time: '2 days ago',
    read: false
  },
  {
    id: 2,
    title: 'Profile update reminder',
    message: 'Please complete your profile to get the most out of our platform.',
    time: '1 week ago',
    read: true
  },
  {
    id: 3,
    title: 'New feature available',
    message: 'We have added new features to the platform. Check them out!',
    time: '2 weeks ago',
    read: true
  }
]

export default function DashboardNotifications() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-gray-400">
            <Check size={16} className="mr-1" />
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" className="text-gray-400">
            <Trash size={16} className="mr-1" />
            Clear all
          </Button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`p-4 hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-blue-900/10' : ''}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-full ${!notification.read ? 'bg-blue-600/20 text-blue-500' : 'bg-gray-800 text-gray-400'}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                    <p className="text-sm text-gray-400">{notification.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Bell size={24} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">No notifications</h3>
            <p className="text-gray-400 text-sm">You don't have any notifications at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
