import React from "react";
import CountUp from "react-countup";
import "./FlightStats.css"; // Arquivo de estilos

const FlightStats = ({ label, value, icon }) => {
  return (
    <div className="counter-container">
      {icon && <i className={`counter-icon ${icon}`}></i>}
      <p className="counter-label">{label}</p>
      <h2 className="counter-value">
        <CountUp 
          start={0} 
          end={value} 
          duration={2} 
          separator="." 
        />
      </h2>
    </div>
  );
};

export default FlightStats;
