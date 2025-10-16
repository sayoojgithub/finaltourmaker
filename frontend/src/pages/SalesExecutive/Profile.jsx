import React, {useState,useEffect} from 'react';
import {
  FiUserPlus,
  FiBarChart2,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiCheck,
} from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import API from '../../api';

const Profile = () => {
  const [profileData, setProfile] = useState(null);
    useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/salesExecutive/profile"); // cookie included by default
        setProfile(res.data);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load profile");
      }
    };
    fetchProfile();
  }, []);
  console.log(profileData)


  return (
    <div className="min-h-screen p-4 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">

        {/* Profile Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg flex flex-col w-full">
          <h2 className="text-2xl md:text-3xl font-Abril text-[#321F6A] mb-2">Profile</h2>
          <p className="text-xs md:text-sm font-Inter text-[#8570EE]">Personal Information</p>

          <div className="flex justify-center mb-4">
            <img
              src="https://www.w3schools.com/howto/img_avatar.png"
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover"
            />
          </div>

          <h3 className="text-lg font-semibold text-center">{profileData?.name || "Loading..."}</h3>
          <p className="text-sm text-gray-500 mb-6 text-center">{profileData?.email || "Loading..."}</p>

          {/* Highlight Cards stacked vertically, smaller on md+ */}
          <div className="flex flex-col gap-4 mt-6">
            <Card icon={<FiBarChart2 />} title="Total Registrations" value={profileData?.companyStats?.total ?? "N/A"} highlight small />
            <Card icon={<MdVerified />} title="Verified" value={profileData?.companyStats?.verified ?? "N/A"} highlight small />
            <Card icon={<FiCheck />} title="Pending Verification" value={profileData?.companyStats?.notVerified ?? "N/A"} highlight small />
          </div>
        </div>

        {/* Performance Section */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-Abril text-[#321F6A] mb-2">Performance</h2>
          <p className="text-xs md:text-sm font-Inter text-[#8570EE] mb-4">Target & achievements</p>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card icon={<FiUserPlus />} title="New Registrations" value={profileData?.companyStats?.newRegistrationsToday ?? "N/A"} />
            <Card icon={<FiUserPlus />} title="Registrations"  value={profileData?.targetPerformance?.totalRegistrations ?? "N/A"} />
            <Card icon={<FiTarget />} title="Target" value={profileData?.latestTarget?.target ?? "N/A"} />
            <Card icon={<FiCheckCircle />} title="Verified" value={profileData?.targetPerformance?.verifiedRegistrations ?? "N/A"} />
          </div>

          {/* Additional white cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card icon={<FiClock />} title="Pending Target" value={profileData?.targetPerformance?.pendingTarget?? "N/A"} />
            <Card icon={<FiCheck />} title="Pending Verified" value={profileData?.targetPerformance?.pendingVerification ?? "N/A"} />
          </div>

          {/* Styled Start and End Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white text-gray-800 hover:shadow-md p-4 rounded-2xl transition-transform transform hover:scale-[1.02]">
              <label className="text-sm text-gray-500 block mb-2">Start Date</label>
               <label className="text-sm text-gray-500 block mb-2">
    {profileData?.latestTarget?.start ?? "N/A"}
  </label>
            </div>
            <div className="bg-white text-gray-800 hover:shadow-md p-4 rounded-2xl transition-transform transform hover:scale-[1.02]">
              <label className="text-sm text-gray-500 block mb-2">End Date</label>
               <label className="text-sm text-gray-500 block mb-2">
    {profileData?.latestTarget?.end ?? "N/A"}
  </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ icon, title, value, highlight, small }) => {
  const basePadding = small ? 'p-3 md:p-2.5' : 'p-4';
  const iconSize = small ? 'w-8 h-8 md:w-7 md:h-7' : 'w-10 h-10';
  const iconStyle = `${iconSize} flex items-center justify-center rounded-full transition-transform duration-200 group-hover:rotate-6 ${
    highlight ? 'bg-white/20 text-white' : 'bg-[#f0edff] text-[#6D5DF5]'
  }`;

  const titleSize = small ? 'text-xs md:text-[11px]' : 'text-sm';
  const valueSize = small ? 'text-base md:text-sm' : 'text-lg';

  return (
    <div
      className={`group flex items-center justify-between ${basePadding} rounded-2xl shadow transition-transform transform hover:scale-[1.02] ${
        highlight
          ? 'bg-gradient-to-r from-[#8570EE] to-[#6D5DF5] text-white hover:shadow-xl'
          : 'bg-white text-gray-800 hover:shadow-md'
      }`}
    >
      <div className="flex items-center gap-3 md:gap-2">
        <div className={iconStyle}>
          {React.cloneElement(icon, { size: small ? 16 : 20 })}
        </div>
        <div className="flex flex-col">
          <p className={`${highlight ? 'text-white' : 'text-gray-500'} ${titleSize}`}>{title}</p>
<p className={`${valueSize} font-semibold mt-1`}>{value}</p>
        </div>
      </div>
    </div>
  );
};

export default Profile;