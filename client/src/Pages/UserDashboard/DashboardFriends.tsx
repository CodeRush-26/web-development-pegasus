import { useState } from 'react'
import { Users, Search, UserPlus, MessageSquare, Gamepad2, MoreHorizontal, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Data will be fetched from API in production
const friends = [];
const friendRequests = [];

export default function DashboardFriends() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'online', 'requests'
  
  // Filter friends based on search query and active tab
  const filteredFriends = friends.filter(friend => {
    const matchesSearch = 
      friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.username.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (activeTab === 'all') return matchesSearch
    if (activeTab === 'online') return matchesSearch && friend.status === 'online'
    
    return matchesSearch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-[var(--gaming-purple)]" />
          Friends
        </h1>
        <Button className="bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)]">
          <UserPlus size={16} className="mr-2" />
          Add Friend
        </Button>
      </div>
      
      {/* Tabs and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex bg-[var(--dashboard-card)] rounded-lg p-1 border border-[var(--dashboard-border)]">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'all'
                ? 'bg-[var(--gaming-purple)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Friends ({friends.length})
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'online'
                ? 'bg-[var(--gaming-purple)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('online')}
          >
            Online ({friends.filter(f => f.status === 'online').length})
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'requests'
                ? 'bg-[var(--gaming-purple)] text-white'
                : 'text-[var(--dashboard-text-muted)] hover:text-[var(--dashboard-text)]'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Requests ({friendRequests.length})
          </button>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--dashboard-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="Search friends..."
            className="w-full pl-10 pr-4 py-2 bg-[var(--dashboard-card)] border border-[var(--dashboard-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--gaming-purple)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Friends List */}
      {activeTab !== 'requests' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFriends.map(friend => (
            <div 
              key={friend.id} 
              className="bg-[var(--dashboard-card)] rounded-xl p-4 border border-[var(--dashboard-border)]"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={friend.avatar} 
                    alt={friend.name} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--dashboard-card)] ${
                    friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{friend.name}</h3>
                  <p className="text-sm text-[var(--dashboard-text-muted)]">@{friend.username}</p>
                </div>
                <div className="flex gap-1">
                  <button className="p-2 rounded-full hover:bg-[var(--dashboard-card-hover)]">
                    <MessageSquare size={18} className="text-[var(--dashboard-text-muted)]" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-[var(--dashboard-card-hover)]">
                    <MoreHorizontal size={18} className="text-[var(--dashboard-text-muted)]" />
                  </button>
                </div>
              </div>
              
              <div className="mt-3 pt-3 border-t border-[var(--dashboard-border)]">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-[var(--dashboard-text-muted)]">
                    {friend.status === 'online' ? (
                      friend.currentGame ? (
                        <div className="flex items-center">
                          <Gamepad2 size={14} className="mr-1 text-green-500" />
                          <span>Playing {friend.currentGame}</span>
                        </div>
                      ) : (
                        <span className="text-green-500">Online</span>
                      )
                    ) : (
                      <span>Last online {friend.lastSeen}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-medium mb-4">Friend Requests</h2>
          
          {friendRequests.map(request => (
            <div 
              key={request.id} 
              className="bg-[var(--dashboard-card)] rounded-xl p-4 border border-[var(--dashboard-border)] flex items-center gap-4"
            >
              <img 
                src={request.avatar} 
                alt={request.name} 
                className="w-12 h-12 rounded-full"
              />
              
              <div className="flex-1">
                <h3 className="font-medium">{request.name}</h3>
                <p className="text-sm text-[var(--dashboard-text-muted)]">
                  @{request.username} • {request.mutualFriends} mutual {request.mutualFriends === 1 ? 'friend' : 'friends'}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="bg-[var(--gaming-purple)] hover:bg-[var(--gaming-purple-light)]">
                  <Check size={16} className="mr-1" />
                  Accept
                </Button>
                <Button size="sm" variant="outline">
                  <X size={16} className="mr-1" />
                  Decline
                </Button>
              </div>
            </div>
          ))}
          
          {friendRequests.length === 0 && (
            <div className="text-center py-8">
              <p className="text-[var(--dashboard-text-muted)]">No friend requests</p>
            </div>
          )}
        </div>
      )}
      
      {activeTab !== 'requests' && filteredFriends.length === 0 && (
        <div className="text-center py-12">
          <Users className="mx-auto mb-4 text-[var(--dashboard-text-muted)]" size={48} />
          <h3 className="text-lg font-medium mb-2">No friends found</h3>
          <p className="text-[var(--dashboard-text-muted)]">
            Try adjusting your search or add new friends
          </p>
        </div>
      )}
    </div>
  )
}
