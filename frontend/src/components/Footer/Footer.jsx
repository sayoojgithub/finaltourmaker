import React from 'react';
import Logo from '../../assets/Logo.png'; // Adjust the path as needed

const Footer = () => {
  return (
    <footer className="bg-[#321F6A] text-white px-4 py-10">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Logo and About */}
        <aside className="md:col-span-2">
          <img src={Logo} alt="Logo" className="w-[150px] mb-4" />
          <p className="text-sm font-light leading-relaxed">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s,
            when an unknown printer took a galley of type and scrambled it to make a type specimen book.
          </p>
        </aside>

        {/* Services */}
        <nav>
          <h6 className="font-semibold text-lg mb-2">Services</h6>
          <ul className="space-y-1 text-sm font-light">
            <li><a className="hover:text-purple-300 cursor-pointer">Branding</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Design</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Marketing</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Advertisement</a></li>
          </ul>
        </nav>

        {/* Company */}
        <nav>
          <h6 className="font-semibold text-lg mb-2">Company</h6>
          <ul className="space-y-1 text-sm font-light">
            <li><a className="hover:text-purple-300 cursor-pointer">About us</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Contact</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Jobs</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Press kit</a></li>
          </ul>
        </nav>

        {/* Legal */}
        <nav>
          <h6 className="font-semibold text-lg mb-2">Legal</h6>
          <ul className="space-y-1 text-sm font-light">
            <li><a className="hover:text-purple-300 cursor-pointer">Terms of use</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Privacy policy</a></li>
            <li><a className="hover:text-purple-300 cursor-pointer">Cookie policy</a></li>
          </ul>
        </nav>
      </div>

      {/* Social Icons */}
      <div className="mt-10 flex justify-center gap-6">
      <a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="fill-current">
          <path
            d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
        </svg>
      </a>
      <a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="fill-current">
          <path
            d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
        </svg>
      </a>
      <a>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="fill-current">
          <path
            d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
        </svg>
      </a>
      </div>
    </footer>
  );
}

export default Footer;
