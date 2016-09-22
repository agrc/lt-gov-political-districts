#!/usr/bin/env python
# * coding: utf8 *
'''
LtGovPallet.py

A module that contains a pallet definition for the data involved in this project
'''

from forklift.models import Pallet
from os.path import join


class LtGovPallet(Pallet):
    def build(self, config):
        self.arcgis_services = [(r'LtGovPoliticalDistricts/Districts', 'MapServer'), (r'LtGovPoliticalDistricts/Labels', 'MapServer')]
        self.sgid = join(self.garage, 'SGID10.sde')
        self.staging = r'C:\\Scheduled\staging'

        self.political = join(self.staging, 'political.gdb')

        self.copy_data = [self.political]

        self.add_crates(['USCongressDistricts2012', 'UtahSenateDistricts2012', 'UtahHouseDistricts2012', 'UtahSchoolBoardDistricts2012'],
                        {'source_workspace': self.sgid, 'destination_workspace': self.political})
